import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import * as fs from 'fs';
import * as rds from '@aws-cdk/aws-rds';

export class AwsSsmMysqlStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const ssm_iam_role = new iam.Role(this, "ssm_iam_role", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "AmazonSSMManagedInstanceCore"
        ),
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "CloudWatchAgentAdminPolicy"
        ),
      ],
    });

    const vpc = new ec2.Vpc(this, 'vpc_ec2_ssm', {
      cidr: "10.0.0.0/16",
      natGateways: 1,
      subnetConfiguration: [
        {
          name: "Public",
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 27,
        },
        {
          name: "Private",
          subnetType: ec2.SubnetType.PRIVATE,
          cidrMask: 27,
        },
      ],
    });

    const cloud_config = ec2.UserData.forLinux({shebang: ''})
    const user_data_script = fs.readFileSync('./lib/user-data.yaml', 'utf8');
    cloud_config.addCommands(user_data_script)
    const multipartUserData = new ec2.MultipartUserData();
    multipartUserData.addPart(ec2.MultipartBody.fromUserData(cloud_config, 'text/cloud-config; charset="utf8"'));
    
    const ec2_instance = new ec2.Instance(this, `ec2_ssm`, {
      instanceType: new ec2.InstanceType("t2.micro"), // 1 Core, 1 GB
//    machineImage: ec2.MachineImage.genericLinux({'us-west-2': 'ami-XXXXXXXXXXXXXXXXX'}),
      machineImage: new ec2.AmazonLinuxImage({
	generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX,
	edition: ec2.AmazonLinuxEdition.STANDARD,
	virtualization: ec2.AmazonLinuxVirt.HVM,
	storage: ec2.AmazonLinuxStorage.GENERAL_PURPOSE,
      }),
      vpc: vpc,
//      blockDevices: [
//	{
//	  deviceName: '/dev/sda1',
//	  volume: ec2.BlockDeviceVolume.ebs(30),
//	},
//      ],
      vpcSubnets: vpc.selectSubnets({
        subnetGroupName: "Private",
      }),
      role: ssm_iam_role,
      userData: multipartUserData,
    });

    const db_instance = new rds.DatabaseInstance(this, 'Instance', {
      //engine: rds.DatabaseInstanceEngine.mysql({ version: rds.MysqlEngineVersion.VER_8_0_19 }),
      engine: rds.DatabaseInstanceEngine.mysql({ version: rds.MysqlEngineVersion.VER_5_7_34 }),
      // optional, defaults to m5.large
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      credentials: rds.Credentials.fromGeneratedSecret('syscdk'), // Optional - will default to 'admin' username and generated password
      vpc,
      vpcSubnets: vpc.selectSubnets({
        subnetGroupName: "Private",
      }),
    });
    
    //
  }
}


// memo:
// - [セッションマネージャー over SSH 経由でプライベートサブネット内のRDSへ接続する方法](https://qiita.com/syoimin/items/eb6d4d9e01f460623531)
// - [AWS CDKでRDSのパスワードを自動生成してコード内で利用する](https://dev.classmethod.jp/articles/automatically-generate-a-password-with-cdk/)


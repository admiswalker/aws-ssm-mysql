# aws-ssm-mysql

## Usage
### deploy
```
npx cdk deploy
```

### get DB password
1. Access `Management Console`
2. Search `AWS Secrets Manager`
3. Click `Retrieve secret value` at `Secret value` section
4. See `password`

### local port forwarding
1. install `AWS CLI 2`
   1. See [Installing or updating the latest version of the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html), and install AWS CLI vewsion 2.
   2. Set below text to  `~/.aws/config`
      ```
      [default]
      region = ap-northeast-1
      ```
2. install `Session Manager Plugin`
   1. See [(Optional) Install the Session Manager plugin for the AWS CLI](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html), and install Session Manager Plugin.
   2. add blow settings to `~/.ssh/config`.
      ```
      # SSH over Session Manager
      host i-* mi-*
      	ProxyCommand sh -c "aws ssm start-session --target %h --document-name AWS-StartSSHSession --parameters 'portNumber=%p'"
      ```

4. ssh port forwarding
   ```
   EC2_INSTANCE_ID=$(aws ec2 describe-instances \
       --filters "Name=tag:Name,Values=AwsSsmMysqlStack/ec2_ssm" \
       --query "Reservations[].Instances[?State.Name=='running'].InstanceId[]" \
       --output text)
   ssh -i ~/.ssh/ec2/id_ed25519 admis@$EC2_INSTANCE_ID -L 3306:xxxxxxxx.xxxxxxxx.ap-northeast-1.rds.amazonaws.com:3306
   ```

### install [MySQL Workbench](https://www.mysql.com/jp/products/workbench/)
1. [download](https://www.mysql.com/jp/products/workbench/)
2. install
3. make connection
   1. run `MySQL Workbench`
   2. clock `+ (plus)` button which is right side of `MySQL Connections`
4. Setup New Connection
   - Connection Name: testdb (Any name is OK)
   - Hostname: localhost
   - Port: 3306
   - Username: <see `get DB password` section>
   - Password: <see `get DB password` section> (click `Store in Keychain...` and save)


### connection test
run below SQL
```SQL
show databses;
```

## memo
### init project
```
mkdir [project name]
cd [project name]
npx cdk init app --language typescript
rm README.md
mv * .[^\.]* ..
cd ..
rm -r [project name]
```

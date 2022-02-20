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
```
EC2_INSTANCE_ID=$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=EC2SSM/ec2_ssm" \
    --query "Reservations[].Instances[?State.Name=='running'].InstanceId[]" \
    --output text)
ssh -i ~/.ssh/ec2/id_ed25519 admis@$EC2_INSTANCE_ID -L 3306:localhost:3306
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

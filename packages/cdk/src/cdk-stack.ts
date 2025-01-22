import { App, Duration, Stack, StackProps, aws_lambda } from 'aws-cdk-lib'
import { Platform } from 'aws-cdk-lib/aws-ecr-assets'
import { DockerImageCode, DockerImageFunction } from 'aws-cdk-lib/aws-lambda'
import { Construct } from 'constructs'
import 'dotenv/config'
import { env } from 'node:process'

const stage = env.DEPLOY_STAGE
const is_production = stage === 'production'
const suffix = is_production ? '' : '-dev'

class CDKStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    new DockerImageFunction(this, 'TaskRunner', {
      code: DockerImageCode.fromImageAsset('dist/task-runner', {
        platform: Platform.LINUX_AMD64
      }),
      architecture: aws_lambda.Architecture.X86_64,
      timeout: Duration.minutes(15),
      memorySize: 512,
      environment: {
        API_BRIDGE_PRIVATE_KEY: env.API_BRIDGE_PRIVATE_KEY!,
        GITHUB_APP_PRIVATEKEY_PKCS8: env.GITHUB_APP_PRIVATEKEY_PKCS8!,
        NODE_AUTH_TOKEN: env.NODE_AUTH_TOKEN!
      }
    }).addFunctionUrl({
      authType: aws_lambda.FunctionUrlAuthType.NONE
    })
  }
}

const app = new App()

new CDKStack(app, `WraithCI${suffix}`, {
  env: {
    account: env.CDK_DEFAULT_ACCOUNT,
    region: env.CDK_DEFAULT_REGION
  }
})

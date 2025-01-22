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

    new DockerImageFunction(this, 'TimeTraveler', {
      code: DockerImageCode.fromImageAsset('dist/time-traveler', {
        platform: Platform.LINUX_AMD64
      }),
      architecture: aws_lambda.Architecture.X86_64,
      timeout: Duration.seconds(30),
      memorySize: 512,
      environment: {
        TIME_TRAVELER_SECRET: env.TIME_TRAVELER_SECRET!,
        CLOUDFLARE_API_TOKEN: env.CLOUDFLARE_API_KEY!,
        CLOUDFLARE_ACCOUNT_ID: env.CLOUDFLARE_ACCOUNT_ID!,
        WRANGLER_LOG: 'none'
      }
    }).addFunctionUrl({
      authType: aws_lambda.FunctionUrlAuthType.NONE
    })
  }
}

const app = new App()

new CDKStack(app, `SolarSystem${suffix}`, {
  env: {
    account: env.CDK_DEFAULT_ACCOUNT,
    region: env.CDK_DEFAULT_REGION
  }
})

<div align="center">

<a href='#enterprise-edition'>
  <img src="./docs/images/ent.svg" alt="icon"/>
</a>

<h1 align="center">NextChat</h1>

One-click free deployment of your private ChatGPT web application, supporting Claude, GPT4 & Gemini Pro models.

[NextChatAI](https://nextchat.club?utm_source=readme) / [Enterprise Edition](#enterprise-edition) / [Demo](https://chat-gpt-next-web.vercel.app/) / [Feedback Issues](https://github.com/Yidadaa/ChatGPT-Next-Web/issues) / [Join Discord](https://discord.gg/zrhvHCr79N)

[<img src="https://vercel.com/button" alt="Deploy on Vercel" height="30">](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FChatGPTNextWeb%2FChatGPT-Next-Web&env=OPENAI_API_KEY&env=CODE&project-name=nextchat&repository-name=NextChat) [<img src="https://zeabur.com/button.svg" alt="Deploy on Zeabur" height="30">](https://zeabur.com/templates/ZBUEFA) [<img src="https://gitpod.io/button/open-in-gitpod.svg" alt="Open in Gitpod" height="30">](https://gitpod.io/#https://github.com/Yidadaa/ChatGPT-Next-Web)

</div>

## 🥳 NextChat iOS Version Released!

> 👉 [Install Now](https://apps.apple.com/us/app/nextchat-ai/id6743085599)

> ❤️ [Source Code Coming Soon](https://github.com/ChatGPTNextWeb/NextChat-iOS)

![Github iOS Image](https://github.com/user-attachments/assets/e0aa334f-4c13-4dc9-8310-e3b09fa4b9f3)

## 🫣 NextChat, MCP Support!

> Requires environment variable (env) `ENABLE_MCP=true` before build

<img src="https://github.com/user-attachments/assets/d8851f40-4e36-4335-b1a4-ec1e11488c7e" />

## Sponsor AI API

<a href='https://302.ai/'>
  <img src="https://github.com/user-attachments/assets/d8c0c513-1e18-4d3b-a2a9-ff3696aec0d4" width="100%" alt="icon"/>
</a>

[302.AI](https://302.ai/) is an on-demand paid AI application platform that provides the most comprehensive AI APIs and AI online applications on the market.

## Enterprise Edition

Meeting your company's private deployment and customization needs

- **Brand Customization**: Enterprise-tailored VI/UI, seamlessly integrated with corporate brand image
- **Resource Integration**: Unified configuration and management of dozens of AI resources by enterprise administrators, team members can use out of the box
- **Permission Management**: Member permissions, resource permissions, knowledge base permissions are clearly layered, unified control through enterprise-level Admin Panel
- **Knowledge Integration**: Integration of internal enterprise knowledge base with AI capabilities, more aligned with enterprise's own business needs than general AI
- **Security Audit**: Automatically intercept sensitive questions, support tracing all historical conversation records, allowing AI to also follow enterprise information security standards
- **Private Deployment**: Enterprise-level private deployment, supporting various mainstream private cloud deployments, ensuring data security and privacy protection
- **Continuous Updates**: Providing continuous update and upgrade services for cutting-edge capabilities such as multimodal, intelligent agents, always new and continuously advanced

Enterprise consultation: **business@nextchat.dev**

## Getting Started

1. Prepare your [OpenAI API Key](https://platform.openai.com/account/api-keys);
2. Click the button on the right to start deployment:
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYidadaa%2FChatGPT-Next-Web&env=OPENAI_API_KEY&env=CODE&env=GOOGLE_API_KEY&project-name=chatgpt-next-web&repository-name=ChatGPT-Next-Web), directly use Github account to log in, remember to fill in the API Key and [page access password](#configure-page-access-password) CODE in the environment variables page;
3. After deployment is complete, you can start using it;
4. (Optional) [Bind custom domain](https://vercel.com/docs/concepts/projects/domains/add-a-domain): The domain DNS assigned by Vercel is polluted in some areas, binding a custom domain can connect directly.

<div align="center">
   
![Main Interface](./docs/images/cover.png)

</div>

## Keep Updated

If you deploy your own project according to the above steps with one click, you may find that it always prompts "update available". This is because Vercel will create a new project for you by default instead of forking this project, which will cause it to be unable to correctly detect updates.
It is recommended that you redeploy according to the following steps:

- Delete the original repository;
- Use the fork button in the upper right corner of the page to fork this project;
- Redeploy in Vercel, [please see the detailed tutorial](./docs/vercel-en.md#how-to-create-a-new-project).

### Enable Automatic Updates

> If you encounter an Upstream Sync execution error, please [manually Sync Fork once](./README_EN.md#manually-update-code)!

After you fork the project, due to Github's limitations, you need to manually go to the Actions page of your forked project to enable Workflows, and enable the Upstream Sync Action. After enabling, you can start hourly scheduled automatic updates:

![Automatic Update](./docs/images/enable-actions.jpg)

![Enable Automatic Update](./docs/images/enable-actions-sync.jpg)

### Manually Update Code

If you want to manually update immediately, you can check [Github's documentation](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork) to learn how to sync the forked project with upstream code.

You can star/watch this project or follow the author to get new feature update notifications in time.

## Configure Page Access Password

> After configuring the password, users need to manually fill in the access code in the settings page to chat normally, otherwise they will be prompted with an unauthorized state message.

> **Warning**: Please make sure to set the password long enough, preferably 7 digits or more, otherwise [it will be blasted](https://github.com/Yidadaa/ChatGPT-Next-Web/issues/518).

This project provides limited access control functionality. Please add an environment variable named `CODE` on the environment variables page of the Vercel project control panel, with the value being custom passwords separated by English commas:

```
code1,code2,code3
```

After adding or modifying this environment variable, please **redeploy** the project to make the changes take effect.

## Environment Variables

> Most configuration items of this project are set through environment variables. Tutorial: [How to modify Vercel environment variables](./docs/vercel-en.md).

### `OPENAI_API_KEY` (Required)

OpenAI key, the api key you applied for on the openai account page, use English commas to separate multiple keys, so you can randomly poll these keys.

### `CODE` (Optional)

Access password, optional, you can use commas to separate multiple passwords.

**Warning**: If you don't fill in this item, anyone can directly use your deployed website, which may cause your token to be consumed rapidly. It is recommended to fill in this option.

### `BASE_URL` (Optional)

> Default: `https://api.openai.com`

> Examples: `http://your-openai-proxy.com`

OpenAI interface proxy URL, if you manually configured an openai interface proxy, please fill in this option.

> If you encounter ssl certificate issues, please set the protocol of `BASE_URL` to http.

### `OPENAI_ORG_ID` (Optional)

Specify the organization ID in OpenAI.

### `AZURE_URL` (Optional)

> Format: https://{azure-resource-url}/openai

Azure deployment address.

### `AZURE_API_KEY` (Optional)

Azure key.

### `AZURE_API_VERSION` (Optional)

Azure Api version, you can find it here: [Azure Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/reference#chat-completions).

### `GOOGLE_API_KEY` (Optional)

Google Gemini Pro key.

### `GOOGLE_URL` (Optional)

Google Gemini Pro Api Url.

### `ANTHROPIC_API_KEY` (Optional)

Anthropic claude Api Key.

### `ANTHROPIC_API_VERSION` (Optional)

Anthropic claude Api version.

### `ANTHROPIC_URL` (Optional)

Anthropic claude Api Url.

### `BAIDU_API_KEY` (Optional)

Baidu Api Key.

### `BAIDU_SECRET_KEY` (Optional)

Baidu Secret Key.

### `BAIDU_URL` (Optional)

Baidu Api Url.

### `BYTEDANCE_API_KEY` (Optional)

ByteDance Api Key.

### `BYTEDANCE_URL` (Optional)

ByteDance Api Url.

### `ALIBABA_API_KEY` (Optional)

Alibaba Cloud (Qianwen) Api Key.

### `ALIBABA_URL` (Optional)

Alibaba Cloud (Qianwen) Api Url.

### `IFLYTEK_URL` (Optional)

iFlytek Spark Api Url.

### `IFLYTEK_API_KEY` (Optional)

iFlytek Spark Api Key.

### `IFLYTEK_API_SECRET` (Optional)

iFlytek Spark Api Secret.

### `CHATGLM_API_KEY` (Optional)

ChatGLM Api Key.

### `CHATGLM_URL` (Optional)

ChatGLM Api Url.

### `DEEPSEEK_API_KEY` (Optional)

DeepSeek Api Key.

### `DEEPSEEK_URL` (Optional)

DeepSeek Api Url.

### `HIDE_USER_API_KEY` (Optional)

If you don't want users to enter their own API Key, set this environment variable to 1.

### `DISABLE_GPT4` (Optional)

If you don't want users to use GPT-4, set this environment variable to 1.

### `ENABLE_BALANCE_QUERY` (Optional)

If you want to enable the balance query function, set this environment variable to 1.

### `DISABLE_FAST_LINK` (Optional)

If you want to disable parsing preset settings from links, set this environment variable to 1.

### `WHITE_WEBDAV_ENDPOINTS` (Optional)

If you want to add allowed webdav service addresses, you can use this option. Format requirements:

- Each address must be a complete endpoint
  > `https://xxxx/xxx`
- Multiple addresses are connected with `,`

### `CUSTOM_MODELS` (Optional)

> Example: `+qwen-7b-chat,+glm-6b,-gpt-3.5-turbo,gpt-4-1106-preview=gpt-4-turbo` means add `qwen-7b-chat` and `glm-6b` to the model list, remove `gpt-3.5-turbo` from the list, and display the `gpt-4-1106-preview` model name as `gpt-4-turbo`.
> If you want to disable all models first, then enable specified models, you can use `-all,+gpt-3.5-turbo`, which means only enable `gpt-3.5-turbo`

Used to control the model list, use `+` to add a model, use `-` to hide a model, use `model name=display name` to customize the model's display name, separated by English commas.

In Azure mode, supports using `modelName@Azure=deploymentName` to configure model name and deployment name (deploy-name)

> Example: `+gpt-3.5-turbo@Azure=gpt35` This configuration will display a `gpt35(Azure)` option in the model list.
> If you can only use Azure mode, then setting `-all,+gpt-3.5-turbo@Azure=gpt35` will make the conversation default to use `gpt35(Azure)`

In ByteDance mode, supports using `modelName@bytedance=deploymentName` to configure model name and deployment name (deploy-name)

> Example: `+Doubao-lite-4k@bytedance=ep-xxxxx-xxx` This configuration will display a `Doubao-lite-4k(ByteDance)` option in the model list

### `DEFAULT_MODEL` (Optional)

Change the default model.

### `VISION_MODELS` (Optional)

> Default value: empty
> Example: `gpt-4-vision,claude-3-opus,my-custom-model` means add vision capabilities to these models, as a supplement to the default pattern matching (default will detect models containing keywords like "vision", "claude-3", "gemini-1.5").

Add more models with vision capabilities beyond the default pattern matching. Multiple models are separated by commas.

### `DEFAULT_INPUT_TEMPLATE` (Optional)

Customize the default template, used to initialize the 'User Input Preprocessing' configuration item in 'Settings'

### `STABILITY_API_KEY` (Optional)

Stability API key.

### `STABILITY_URL` (Optional)

Custom Stability API request address.

### `ENABLE_MCP` (Optional)

Enable MCP (Model Context Protocol) functionality.

### `SILICONFLOW_API_KEY` (Optional)

SiliconFlow API Key.

### `SILICONFLOW_URL` (Optional)

SiliconFlow API URL.

### `AI302_API_KEY` (Optional)

302.AI API Key.

### `AI302_URL` (Optional)

302.AI API URL.

## Development

Click the button below to start secondary development:

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/Yidadaa/ChatGPT-Next-Web)

Before starting to write code, you need to create a `.env.local` file in the project root directory and fill in the environment variables:

```
OPENAI_API_KEY=<your api key here>

# For users in mainland China, you can use the proxy that comes with this project for development, or you can freely choose other proxy addresses
BASE_URL=https://b.nextweb.fun/api/proxy
```

### Local Development

1. Install nodejs 18 and yarn, please ask ChatGPT for specific details;
2. Execute `yarn install && yarn dev`. ⚠️ Note: This command is only for local development, don't use it for deployment!
3. If you want to deploy locally, please use the `yarn install && yarn build && yarn start` command. You can use pm2 to guard the process to prevent it from being killed. For details, ask ChatGPT.

## Deployment

### Baota Panel Deployment

> [English > How to deploy through Baota one-click](./docs/bt-en.md)

### Container Deployment (Recommended)

> Docker version needs to be 20 and above, otherwise it will prompt that the image cannot be found.

> ⚠️ Note: The docker version will lag behind the latest version by 1 to 2 days most of the time, so there will be a continuous "update available" prompt after deployment, which is normal.

```shell
docker pull yidadaa/chatgpt-next-web

docker run -d -p 3000:3000 \
   -e OPENAI_API_KEY=sk-xxxx \
   -e CODE=page access password \
   yidadaa/chatgpt-next-web
```

You can also specify a proxy:

```shell
docker run -d -p 3000:3000 \
   -e OPENAI_API_KEY=sk-xxxx \
   -e CODE=page access password \
   --net=host \
   -e PROXY_URL=http://127.0.0.1:7890 \
   yidadaa/chatgpt-next-web
```

To enable MCP functionality, you can use:

```shell
docker run -d -p 3000:3000 \
   -e OPENAI_API_KEY=sk-xxxx \
   -e CODE=page access password \
   -e ENABLE_MCP=true \
   yidadaa/chatgpt-next-web
```

If your local proxy needs account and password, you can use:

```shell
-e PROXY_URL="http://127.0.0.1:7890 user password"
```

If you need to specify other environment variables, please add `-e environment variable=environment variable value` to the above command to specify.

### Local Deployment

Run the following command in the console:

```shell
bash <(curl -s https://raw.githubusercontent.com/Yidadaa/ChatGPT-Next-Web/main/scripts/setup.sh)
```

⚠️ Note: If you encounter problems during installation, please use docker deployment.

## Acknowledgments

### Donors

> See English version.

### Contributors

[See project contributors list](https://github.com/Yidadaa/ChatGPT-Next-Web/graphs/contributors)

### Related Projects

- [one-api](https://github.com/songquanpeng/one-api): One-stop large model quota management platform, supporting all mainstream large language models on the market

## Open Source License

[MIT](https://opensource.org/license/mit/)

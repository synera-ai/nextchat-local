# User Manual

> This document explains some feature introductions and design principles of NextChat.

## Masks

### What is a Mask? What's the difference from prompts?

Mask = Multiple preset prompts + Model settings + Chat settings.

Among them, preset prompts (Contextual Prompts) are generally used for In-Context Learning, to make ChatGPT generate more compliant outputs, and can also add system constraints or inject limited additional knowledge.

Model settings, as the name suggests, all conversations created using this mask will use the corresponding model parameters by default.

Chat settings are a series of settings related to the chat experience, which we will introduce in the following sections.

### How to add a preset mask?

Currently, preset masks can only be added by editing the source code. Please edit the corresponding language files in the [mask](../app/masks/) directory as needed.

The editing steps are as follows:

1. Configure a mask in NextChat;
2. Use the download button on the mask editing page to save the mask as JSON format;
3. Let ChatGPT help you format the json file into corresponding ts code;
4. Put it into the corresponding .ts file.

Subsequent versions will add the ability to load masks using side-loading.

## Chat

### Functions of buttons above the chat box

In the default state, move the mouse over the button to see the button's text description. We introduce them in order:

- Chat settings: Current chat settings, its relationship with global settings, please see the explanation in the next section;
- Color theme: Click to cycle between automatic, dark, and light;
- Quick commands: Built-in quick fill preset prompts, you can also search by typing / in the chat box;
- All masks: Enter the mask page;
- Clear chat: Insert a clear marker, chats above the marker will not be sent to GPT, the effect is equivalent to clearing the current conversation, of course, you can also click this button again to cancel the clear;
- Model settings: Change the current chat's model, note that this button only modifies the current chat's model and does not modify the global default model.

### Relationship between chat settings and global settings

Currently there are two setting entrances:

1. The settings button in the lower left corner of the page, which leads to the global settings page;
2. The settings button above the chat box, which leads to the chat settings page.

After creating a new chat, the chat's settings are synchronized with the global settings by default. Modifying global settings will also synchronously modify the chat settings of new chats.

Once the user manually changes the chat settings, the chat settings will be disconnected from the global settings. At this time, changing global settings will not take effect on this chat.

If you want to restore the synchronization relationship between the two, you can check the "Chat Settings -> Use Global Settings" option.

### Meaning of chat settings

Click the button above the chat box to enter chat settings. The content from top to bottom is:

- Preset prompt list: can add, delete, and sort preset prompts
- Character avatar: as the name suggests
- Character name: as the name suggests
- Hide preset conversation: after hiding, preset prompts will not appear in the chat interface
- Use global settings: used to indicate whether the current chat uses global chat settings
- Model setting options: the remaining options have the same meaning as global setting options, see the next section

### Meaning of global settings

- model / temperature / top_p / max_tokens / presence_penalty / frequency_penalty are all ChatGPT setting parameters. For details, please refer to the OpenAI official documentation, which will not be repeated here;
- Inject system-level prompt information, user input preprocessing: For details, please see [https://github.com/Yidadaa/ChatGPT-Next-Web/issues/2144](https://github.com/Yidadaa/ChatGPT-Next-Web/issues/2144)
- Number of historical messages attached: When the user inputs a message and sends it, the number of recent n messages carried;
- Historical message length compression threshold: When the generated chat word count reaches this value, the historical summary function will be automatically triggered;
- Historical summary: whether to enable the historical summary function.

### What is historical summary?

The historical summary function, also known as the historical message compression function, is the key to maintaining historical memory in long conversation scenarios. Proper use of this function can save the tokens used without losing historical topic information.

Due to ChatGPT API's length limitations, let's take the 3.5 model as an example. It can only accept conversation messages less than 4096 tokens. Once this value is exceeded, an error will be reported.

At the same time, in order to let ChatGPT understand the context of our conversation, we often carry multiple historical messages to provide context information. When the conversation continues for a while, it is easy to trigger the length limit.

To solve this problem, we have added a historical record compression function. Assuming the threshold is 1000 characters, every time the user's chat record exceeds 1000 characters, messages that have not been summarized will be sent to ChatGPT to generate a summary of about 100 words.

In this way, historical information is compressed from 1000 words to 100 words. This is a lossy compression, but it can meet most usage scenarios.

### When should historical summary be turned off?

Historical summary may affect the quality of ChatGPT conversations, so if the conversation scenario is translation, information extraction and other one-time conversation scenarios, please directly turn off the historical summary function and set the number of historical messages to 0.

### What information is sent when the user sends a message?

When the user inputs a message in the chat box, the message sent to ChatGPT includes the following parts:

1. System-level prompts: Used to get as close as possible to the ChatGPT official WebUI experience, this information can be turned off in settings;
2. Historical summary: As long-term memory, providing long-term but vague context information;
3. Preset prompts: Preset prompts set in the current chat, used for In-Context Learning or injecting system-level constraints;
4. Recent n conversation records: As short-term memory, providing short-term but precise context information;
5. User's current input message.

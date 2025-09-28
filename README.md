# Django Transcription Starter

[![Discord](https://dcbadge.vercel.app/api/server/xWRaCDBtW4?style=flat)](https://discord.gg/xWRaCDBtW4)


This sample demonstrates interacting with the Deepgram API from Django to make transcriptions of prerecorded files. It uses the Deepgram Python SDK, with a javascript client built from web components (no `npm` requirements).

## ✨ New Features

This enhanced version includes:

- **🎭 Sentiment Analysis**: Real-time sentiment detection (positive, negative, neutral) with confidence scores
- **🤖 Multiple Models**: Support for Nova-2, Nova-3, Whisper Cloud, Base, and Enhanced models
- **📥 Export Options**: Export transcripts in JSON, TXT, SRT, and VTT formats
- **💾 Auto-Save**: Automatic JSON result saving with timestamps
- **🎨 Enhanced UI**: Color-coded sentiment display and organized export functionality
- **📊 Advanced Features**: Summarization, topic detection, diarization, and more

## What is Deepgram?

[Deepgram’s](https://deepgram.com/) voice AI platform provides APIs for speech-to-text, text-to-speech, and full speech-to-speech voice agents. Over 200,000+ developers use Deepgram to build voice AI products and features.

## Sign-up to Deepgram

Before you start, it's essential to generate a Deepgram API key to use in this project. [Sign-up now for Deepgram and create an API key](https://console.deepgram.com/signup?jump=keys)..

## Quickstart

### Manual

Follow these steps to get started with this starter application.

#### Clone the repository

Go to GitHub and [clone the repository](https://github.com/deepgram-starters/prerecorded-django-starter).

#### Install dependencies

Install the project dependencies.

```bash
pip install -r requirements.txt
```

#### Edit the config file

Copy the code from `sample.env` and create a new file called `.env`. **Replace `%api_key%` with your actual API key** you generated in the [Deepgram console](https://console.deepgram.com/).

```bash
DEEPGRAM_API_KEY=your_actual_api_key_here
```

⚠️ **Important**: Make sure to replace `%api_key%` with your real Deepgram API key, not the placeholder text!

#### Run the application

Once running, you can [access the application in your browser](http://localhost:8080/).

```bash
python ./app.py runserver localhost:8080
```

## Setting up a Python developer environment

Install `virtualenv`.

```bash
pip install virtualenv
```

Create a virtual environment.

```bash
python -m venv env
```

Activate the environment.

```bash
source env/bin/activate
```

Then install your dependencies with pip and they will be installed in the virtual environment rather than your user.

```bash
pip install -r requirements.txt
```

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Security Policy](./SECURITY.md) details the procedure for contacting Deepgram.

## Getting Help

We love to hear from you so if you have questions, comments or find a bug in the project, let us know! You can either:

- [Open an issue in this repository](https://github.com/deepgram-starters/prerecorded-django-starter/issues/new)
- [Join the Deepgram Github Discussions Community](https://github.com/orgs/deepgram/discussions)
- [Join the Deepgram Discord Community](https://discord.gg/xWRaCDBtW4)

## Author

[Deepgram](https://deepgram.com)

## License

This project is licensed under the MIT license. See the [LICENSE](./LICENSE) file for more info.

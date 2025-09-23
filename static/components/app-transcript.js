import { html, css, LitElement } from "//cdn.skypack.dev/lit@v2.8.0";

class AppTranscript extends LitElement {
  static properties = {
    result: {},
    transcript: {},
    summary: {},
    topics: {},
    diarize: {},
    sentiments: {},
  };
  static styles = css`
    section {
      background: #2e3c4d;
      height: fit-content;
      width: 896px;
      margin-bottom: 10px;
      padding: 1.25rem;
      border-radius: 0.0625rem;
      border: solid #3d4f66 1px;
    }

    topics-section {
      display: flex;
      padding-right: 6px;
    }

    .diarize-section {
      padding-bottom: 6px;
    }

    .sentiment-section {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      padding: 10px 0;
    }

    .sentiment-item {
      background: #3d4f66;
      padding: 8px 12px;
      border-radius: 4px;
      border: 1px solid #4a5d7a;
    }

    .sentiment-positive {
      border-color: #22c55e;
      background: rgba(34, 197, 94, 0.1);
    }

    .sentiment-negative {
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
    }

    .sentiment-neutral {
      border-color: #6b7280;
      background: rgba(107, 114, 128, 0.1);
    }

    .export-section {
      display: flex;
      gap: 10px;
      margin-top: 15px;
      flex-wrap: wrap;
    }

    .export-button {
      background: linear-gradient(95deg, #1796c1 20%, #15bdae 40%, #13ef95 95%);
      border: none;
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
    }

    .export-button:hover {
      opacity: 0.9;
    }
  `;
  constructor() {
    super();
    this.transcript = "";
    this.summary = "";
    this.topics = [];
    this.diarize = "";
    this.sentiments = [];
  }

  update(changedProps) {
    if (changedProps.has("result")) {
      this.setResults();
    }
    super.update(changedProps);
  }

  setResults() {
    if (
      this.result &&
      this.result.channels &&
      this.result.channels[0] &&
      this.result.channels[0].alternatives &&
      this.result.channels[0].alternatives[0] &&
      this.result.channels[0].alternatives[0].transcript
    ) {
      this.transcript = this.result.channels[0].alternatives[0].transcript;
      this.requestUpdate();
    }
    if (
      this.result &&
      this.result.channels &&
      this.result.channels[0] &&
      this.result.channels[0].alternatives &&
      this.result.channels[0].alternatives[0] &&
      this.result.channels[0].alternatives[0].summaries
    ) {
      this.summary =
        this.result.channels[0].alternatives[0].summaries[0].summary;
      this.requestUpdate();
    }
    if (
      this.result &&
      this.result.channels &&
      this.result.channels[0] &&
      this.result.channels[0].alternatives &&
      this.result.channels[0].alternatives[0] &&
      this.result.channels[0].alternatives[0].topics
    ) {
      let topicCategories;
      this.result.channels[0].alternatives[0].topics.forEach((topic) => {
        topicCategories = topic.topics;
        topicCategories.forEach((t) => {
          this.topics.push(t.topic);
        });
      });
    }

    if (this.result && this.result.utterances) {
      this.diarize = formatConversation(this.result.utterances);

      function formatConversation(response) {
        const utterances = response;
        const conversation = [];

        let currentSpeaker = -1;
        let currentUtterance = "";

        for (const utterance of utterances) {
          if (utterance.speaker !== currentSpeaker) {
            if (currentUtterance !== "") {
              conversation.push(currentUtterance);
            }

            currentSpeaker = utterance.speaker;
            currentUtterance = `Speaker ${currentSpeaker}: ${utterance.transcript}`;
          } else {
            currentUtterance += ` ${utterance.transcript}`;
          }
        }

        if (currentUtterance !== "") {
          conversation.push(currentUtterance);
        }

        return conversation;
      }
    }

    // Handle sentiment analysis results
    if (
      this.result &&
      this.result.channels &&
      this.result.channels[0] &&
      this.result.channels[0].alternatives &&
      this.result.channels[0].alternatives[0] &&
      this.result.channels[0].alternatives[0].sentiments
    ) {
      this.sentiments = this.result.channels[0].alternatives[0].sentiments;
      this.requestUpdate();
    }
  }

  exportJSON() {
    const dataStr = JSON.stringify(this.result, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `transcript_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  exportTXT() {
    const dataStr = this.transcript;
    const dataUri = 'data:text/plain;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `transcript_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.txt`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  exportSRT() {
    if (!this.result.channels?.[0]?.alternatives?.[0]?.words) {
      alert('SRT export requires word-level timestamps. Please enable utterances or diarization.');
      return;
    }

    const words = this.result.channels[0].alternatives[0].words;
    let srtContent = '';
    let counter = 1;
    let currentText = '';
    let startTime = 0;
    let endTime = 0;
    
    const formatTime = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      const ms = Math.floor((seconds % 1) * 1000);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
    };

    for (let i = 0; i < words.length; i++) {
      if (currentText === '') {
        startTime = words[i].start;
      }
      
      currentText += words[i].word + ' ';
      endTime = words[i].end;
      
      // Create subtitle every 10 words or at end
      if ((i + 1) % 10 === 0 || i === words.length - 1) {
        srtContent += `${counter}\n`;
        srtContent += `${formatTime(startTime)} --> ${formatTime(endTime)}\n`;
        srtContent += `${currentText.trim()}\n\n`;
        counter++;
        currentText = '';
      }
    }

    const dataUri = 'data:text/plain;charset=utf-8,'+ encodeURIComponent(srtContent);
    const exportFileDefaultName = `transcript_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.srt`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  exportVTT() {
    if (!this.result.channels?.[0]?.alternatives?.[0]?.words) {
      alert('VTT export requires word-level timestamps. Please enable utterances or diarization.');
      return;
    }

    const words = this.result.channels[0].alternatives[0].words;
    let vttContent = 'WEBVTT\n\n';
    let counter = 1;
    let currentText = '';
    let startTime = 0;
    let endTime = 0;
    
    const formatTime = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = (seconds % 60).toFixed(3);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.padStart(6, '0')}`;
    };

    for (let i = 0; i < words.length; i++) {
      if (currentText === '') {
        startTime = words[i].start;
      }
      
      currentText += words[i].word + ' ';
      endTime = words[i].end;
      
      // Create subtitle every 10 words or at end
      if ((i + 1) % 10 === 0 || i === words.length - 1) {
        vttContent += `${formatTime(startTime)} --> ${formatTime(endTime)}\n`;
        vttContent += `${currentText.trim()}\n\n`;
        counter++;
        currentText = '';
      }
    }

    const dataUri = 'data:text/plain;charset=utf-8,'+ encodeURIComponent(vttContent);
    const exportFileDefaultName = `transcript_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.vtt`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  displayResults() {
    if (this.transcript.length > 0) {
      return html`
        <section>Transcript: ${this.transcript}</section>
        ${
          this.summary
            ? html` <section>Summary: ${this.summary}</section>`
            : null
        }
        ${
          this.topics.length > 0
            ? html` <section>
              Topics:
              ${
                this.topics &&
                this.topics.map((topic) => html`<div>${topic}</div>`)
              }
            </section>`
            : null
        }
        ${
          this.diarize
            ? html`<section>
              ${
                this.diarize &&
                this.diarize.map((speaker) => {
                  return html`<div class="diarize-section">${speaker}</div>`;
                })
              }
            </section>`
            : null
        }
        ${
          this.sentiments && this.sentiments.length > 0
            ? html`<section>
              Sentiment Analysis:
              <div class="sentiment-section">
                ${
                  this.sentiments.map((sentiment) => 
                    html`<div class="sentiment-item sentiment-${sentiment.sentiment.toLowerCase()}">
                      ${sentiment.text} - <strong>${sentiment.sentiment}</strong> (${Math.round(sentiment.confidence * 100)}%)
                    </div>`
                  )
                }
              </div>
            </section>`
            : null
        }
        <section>
          <div class="export-section">
            <button class="export-button" @click="${this.exportJSON}">Export JSON</button>
            <button class="export-button" @click="${this.exportTXT}">Export TXT</button>
            <button class="export-button" @click="${this.exportSRT}">Export SRT</button>
            <button class="export-button" @click="${this.exportVTT}">Export VTT</button>
          </div>
        </section>
      `;
    } else {
      return null;
    }
  }

  render() {
    return html`<div>${this.displayResults()}</div>`;
  }
}

customElements.define("app-transcript", AppTranscript);

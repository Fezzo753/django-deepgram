import { html, css, LitElement } from "//cdn.skypack.dev/lit@v2.8.0";

class AppLanguageSelect extends LitElement {
  static properties = {
    languages: {},
    selectedLanguage: {},
    selectedModel: {},
    selectedFeatures: {},
  };

  static styles = css`
    .app-language-select {
      margin-top: 2rem;
      width: 80rem;
      display: grid;
      gap: 1.25rem;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      grid-template-columns: 35% 20% 10%;
      column-gap: 1rem;
      padding-inline-start: 0px;
    }

    .select-container {
      display: flex;
      flex-direction: column;
      grid-column: 2;
    }

    select {
      padding: 0 16px;
      width: 100%;
      font-size: 14px;
      box-shadow: 0 20px 25px -5px black, 0 8px 10px -6px black;
      color: white;
      height: 51px;
      margin-bottom: 2rem;
      border-radius: 0.0625rem;
      background: #2e3c4d;
      border: solid #3d4f66 1px;
      -moz-appearance: none;
      -webkit-appearance: none;
      appearance: none;
      background-image: url("assets/select.svg");
      background-repeat: no-repeat, repeat;
      background-position: right 0.7em top 50%, 0 0;
      background-size: 14px auto, 150%;
    }

    label {
      margin-bottom: 0.75rem;
    }

    .alert {
      background: #f44336;
      color: white;
      padding: 10px;
      border-radius: 0.0625rem;
      margin-top: 10px;
      display: none;
    }

    .alert.show {
      display: block;
    }
  `;

  constructor() {
    super();
    this.selectedLanguage = "en-US";
    this.selectedModel = "";
    this.selectedFeatures = {};
    
    // Deepgram supported languages based on their documentation
    this.languages = [
      { code: "en-US", name: "English (US)", sentiment: true },
      { code: "en-GB", name: "English (UK)", sentiment: true },
      { code: "en-AU", name: "English (Australia)", sentiment: true },
      { code: "en-NZ", name: "English (New Zealand)", sentiment: true },
      { code: "en-IN", name: "English (India)", sentiment: true },
      { code: "zh", name: "Chinese (Mandarin)", sentiment: false },
      { code: "zh-CN", name: "Chinese (Simplified)", sentiment: false },
      { code: "zh-TW", name: "Chinese (Traditional)", sentiment: false },
      { code: "nl", name: "Dutch", sentiment: false },
      { code: "fr", name: "French", sentiment: false },
      { code: "fr-CA", name: "French (Canada)", sentiment: false },
      { code: "de", name: "German", sentiment: false },
      { code: "hi", name: "Hindi", sentiment: false },
      { code: "hi-Latn", name: "Hindi (Latin)", sentiment: false },
      { code: "id", name: "Indonesian", sentiment: false },
      { code: "it", name: "Italian", sentiment: false },
      { code: "ja", name: "Japanese", sentiment: false },
      { code: "ko", name: "Korean", sentiment: false },
      { code: "no", name: "Norwegian", sentiment: false },
      { code: "pl", name: "Polish", sentiment: false },
      { code: "pt", name: "Portuguese", sentiment: false },
      { code: "pt-BR", name: "Portuguese (Brazil)", sentiment: false },
      { code: "ru", name: "Russian", sentiment: false },
      { code: "es", name: "Spanish", sentiment: false },
      { code: "es-419", name: "Spanish (Latin America)", sentiment: false },
      { code: "sv", name: "Swedish", sentiment: false },
      { code: "ta", name: "Tamil", sentiment: false },
      { code: "tr", name: "Turkish", sentiment: false },
      { code: "uk", name: "Ukrainian", sentiment: false },
    ];
  }

  get _select() {
    return (this.___select ??=
      this.renderRoot?.querySelector("select") ?? null);
  }

  get _alert() {
    return (this.___alert ??=
      this.renderRoot?.querySelector(".alert") ?? null);
  }

  firstUpdated() {
    this.renderRoot.querySelector("select").selectedIndex = 0;
    this._dispatchSelectLanguage();
  }

  _dispatchSelectLanguage() {
    this.selectedLanguage = this._select.value;

    const language = this.languages.find((lang) => lang.code === this.selectedLanguage);

    if (this.selectedLanguage) {
      const options = {
        detail: { 
          code: this.selectedLanguage, 
          language: language,
          supportsSentiment: language?.sentiment || false 
        },
        bubbles: true,
        composed: true,
      };
      this.dispatchEvent(new CustomEvent("languageselect", options));
    }

    // Check for sentiment analysis compatibility
    this._checkSentimentCompatibility();
  }

  _checkSentimentCompatibility() {
    const language = this.languages.find((lang) => lang.code === this.selectedLanguage);
    const hasSentimentAnalysis = this.selectedFeatures?.analyze_sentiment;

    if (hasSentimentAnalysis && language && !language.sentiment) {
      this._showAlert(`Sentiment analysis is not supported for ${language.name}. Please select an English variant or disable sentiment analysis.`);
    } else {
      this._hideAlert();
    }
  }

  _showAlert(message) {
    if (this._alert) {
      this._alert.textContent = message;
      this._alert.classList.add("show");
    }
  }

  _hideAlert() {
    if (this._alert) {
      this._alert.classList.remove("show");
    }
  }

  // Update compatibility when features change - listen to document events
  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('featureselect', this._handleFeatureChange.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('featureselect', this._handleFeatureChange.bind(this));
  }

  _handleFeatureChange(e) {
    this.selectedFeatures = e.detail;
    this._checkSentimentCompatibility();
  }

  render() {
    return html`<div class="app-language-select">
      <div class="select-container">
        <label>Language:</label>
        <div class="styled-select">
          <select @change=${this._dispatchSelectLanguage}>
            ${this.languages.map(
              (language) =>
                html`<option value="${language.code}">${language.name}</option>`
            )}
          </select>
        </div>
        <div class="alert"></div>
      </div>
    </div>`;
  }
}

customElements.define("app-language-select", AppLanguageSelect);
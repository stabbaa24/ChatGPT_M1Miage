export const environment = {
    production: false,
    get openaiApiKey() {
      return localStorage.getItem('openaiApiKey') || 'votre_clé_par_défaut';
    }
  };
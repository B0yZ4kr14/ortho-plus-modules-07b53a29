export const clinicalThemes = {
  light: {
    name: 'Light',
    background: 'hsl(0, 0%, 100%)',
    foreground: 'hsl(222.2, 84%, 4.9%)',
    card: 'hsl(0, 0%, 100%)',
    cardForeground: 'hsl(222.2, 84%, 4.9%)',
    primary: 'hsl(221.2, 83.2%, 53.3%)',
    primaryForeground: 'hsl(210, 40%, 98%)',
    odontograma: {
      higido: 'hsl(142, 76%, 36%)', // Verde
      carie: 'hsl(0, 84%, 60%)',    // Vermelho
      tratado: 'hsl(221, 83%, 53%)', // Azul
      ausente: 'hsl(0, 0%, 45%)',    // Cinza
      implante: 'hsl(262, 83%, 58%)', // Roxo
    },
  },
  dark: {
    name: 'Dark',
    background: 'hsl(222.2, 84%, 4.9%)',
    foreground: 'hsl(210, 40%, 98%)',
    card: 'hsl(222.2, 84%, 4.9%)',
    cardForeground: 'hsl(210, 40%, 98%)',
    primary: 'hsl(217.2, 91.2%, 59.8%)',
    primaryForeground: 'hsl(222.2, 47.4%, 11.2%)',
    odontograma: {
      higido: 'hsl(142, 71%, 45%)',
      carie: 'hsl(0, 72%, 51%)',
      tratado: 'hsl(221, 83%, 63%)',
      ausente: 'hsl(0, 0%, 63%)',
      implante: 'hsl(262, 83%, 68%)',
    },
  },
  highContrast: {
    name: 'High Contrast',
    background: 'hsl(0, 0%, 0%)',
    foreground: 'hsl(0, 0%, 100%)',
    card: 'hsl(0, 0%, 10%)',
    cardForeground: 'hsl(0, 0%, 100%)',
    primary: 'hsl(0, 0%, 100%)',
    primaryForeground: 'hsl(0, 0%, 0%)',
    odontograma: {
      higido: 'hsl(120, 100%, 50%)',  // Verde puro
      carie: 'hsl(0, 100%, 50%)',     // Vermelho puro
      tratado: 'hsl(240, 100%, 50%)', // Azul puro
      ausente: 'hsl(0, 0%, 50%)',     // Cinza
      implante: 'hsl(280, 100%, 50%)', // Roxo puro
    },
  },
  warm: {
    name: 'Warm (Dental Spa)',
    background: 'hsl(30, 30%, 96%)',
    foreground: 'hsl(30, 20%, 20%)',
    card: 'hsl(30, 40%, 98%)',
    cardForeground: 'hsl(30, 20%, 20%)',
    primary: 'hsl(30, 80%, 55%)',
    primaryForeground: 'hsl(0, 0%, 100%)',
    odontograma: {
      higido: 'hsl(142, 60%, 45%)',
      carie: 'hsl(15, 80%, 50%)',
      tratado: 'hsl(30, 80%, 55%)',
      ausente: 'hsl(30, 10%, 50%)',
      implante: 'hsl(280, 60%, 55%)',
    },
  },
} as const;

export type ClinicalTheme = keyof typeof clinicalThemes;

export function applyClinicalTheme(theme: ClinicalTheme) {
  const colors = clinicalThemes[theme];
  const root = document.documentElement;

  // Aplicar cores principais
  root.style.setProperty('--background', colors.background);
  root.style.setProperty('--foreground', colors.foreground);
  root.style.setProperty('--card', colors.card);
  root.style.setProperty('--card-foreground', colors.cardForeground);
  root.style.setProperty('--primary', colors.primary);
  root.style.setProperty('--primary-foreground', colors.primaryForeground);

  // Aplicar cores do odontograma
  root.style.setProperty('--odonto-higido', colors.odontograma.higido);
  root.style.setProperty('--odonto-carie', colors.odontograma.carie);
  root.style.setProperty('--odonto-tratado', colors.odontograma.tratado);
  root.style.setProperty('--odonto-ausente', colors.odontograma.ausente);
  root.style.setProperty('--odonto-implante', colors.odontograma.implante);

  // Salvar preferência
  localStorage.setItem('clinical-theme', theme);
}

export function getClinicalTheme(): ClinicalTheme {
  const saved = localStorage.getItem('clinical-theme') as ClinicalTheme;
  return saved && saved in clinicalThemes ? saved : 'light';
}

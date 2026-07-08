export const SUPPORTED_LANGUAGES = [
  { id: 54, name: "C++ (GCC 9.2.0)" },
  { id: 50, name: "C (GCC 9.2.0)" },
  { id: 71, name: "Python (3.8.1)" },
  { id: 62, name: "Java (OpenJDK 13.0.1)" },
  { id: 63, name: "JavaScript (Node.js 12.14.0)" },
  { id: 51, name: "C# (Mono 6.6.0.161)" },
];

const supportedMatchers = [
  { key: "cpp", test: (name) => name.includes("c++") || name.includes("cpp") },
  { key: "c", test: (name) => /^c\s|\(gcc/.test(name) && !name.includes("c++") && !name.includes("c#") },
  { key: "python", test: (name) => name.includes("python") },
  { key: "java", test: (name) => name.includes("java") && !name.includes("javascript") },
  { key: "javascript", test: (name) => name.includes("javascript") || name.includes("node.js") },
  { key: "csharp", test: (name) => name.includes("c#") || name.includes("csharp") },
];

export function limitSupportedLanguages(languages) {
  if (!Array.isArray(languages) || languages.length === 0) return SUPPORTED_LANGUAGES;

  const selected = supportedMatchers
    .map((matcher) => languages.find((language) => matcher.test((language.name || "").toLowerCase())))
    .filter(Boolean);

  return selected.length === supportedMatchers.length ? selected : SUPPORTED_LANGUAGES;
}

export function getDefaultLanguage(languages) {
  const stored = JSON.parse(localStorage.getItem("selected_language") || "null");
  return languages.find((language) => language.id === stored?.id) || languages[0] || SUPPORTED_LANGUAGES[0];
}

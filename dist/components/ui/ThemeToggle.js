"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeToggle = void 0;
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
const next_themes_1 = require("next-themes");
const button_1 = require("./button");
const ThemeToggle = () => {
    const { theme, setTheme } = (0, next_themes_1.useTheme)();
    return (<button_1.Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      <lucide_react_1.Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"/>
      <lucide_react_1.Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"/>
      <span className="sr-only">Toggle theme</span>
    </button_1.Button>);
};
exports.ThemeToggle = ThemeToggle;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const SniperInterface_1 = require("../components/SniperInterface");
const Sniper = () => {
    return (<div className="space-y-6">
      <h1 className="text-3xl font-bold">Sniper</h1>
      <SniperInterface_1.SniperInterface />
    </div>);
};
exports.default = Sniper;

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageUpload = void 0;
const react_1 = __importStar(require("react"));
const react_dropzone_1 = require("react-dropzone");
const card_1 = require("./card");
const utils_1 = require("@/lib/utils");
const ImageUpload = ({ value, onChange, placeholder = 'Upload image', className }) => {
    const [_url, setUrl] = (0, react_1.useState)('');
    const onDrop = (0, react_1.useCallback)(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file)
            return;
        try {
            // Here you would typically upload the file to a storage service
            // For now, we'll create a local URL
            const url = URL.createObjectURL(file);
            onChange(url);
        }
        catch (error) {
            console.error('Failed to upload image:', error);
        }
    }, [onChange]);
    const { getRootProps, getInputProps, isDragActive } = (0, react_dropzone_1.useDropzone)({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif']
        },
        maxFiles: 1
    });
    return (<card_1.Card {...getRootProps()} className={(0, utils_1.cn)('border-2 border-dashed p-4 cursor-pointer hover:border-primary transition-colors', isDragActive && 'border-primary bg-primary/5', className)}>
      <input {...getInputProps()}/>
      {value ? (<div className="relative aspect-square">
          <img src={value} alt="Uploaded" className="w-full h-full object-cover rounded-md"/>
        </div>) : (<div className="flex flex-col items-center justify-center aspect-square text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
            <circle cx="9" cy="9" r="2"/>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
          </svg>
          <p className="text-sm">{placeholder}</p>
        </div>)}
    </card_1.Card>);
};
exports.ImageUpload = ImageUpload;

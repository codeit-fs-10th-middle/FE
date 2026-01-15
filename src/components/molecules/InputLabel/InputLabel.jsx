// src/components/molecules/InputLabel/InputLabel.jsx
"use client";

import Input from "../../atoms/Input/Input";
import Label from "../../atoms/Label/Label";
import { Styles } from "./InputLabel.module.css";

export default function InputLabel({ label, placeholder, value, onChange, className }) {
    return (
        <div className={`${Styles.inputLabel} ${className}`}>
            <Label>{label}</Label>
            <Input className={Styles.input} type="text" placeholder={placeholder} value={value} onChange={onChange} />
        </div>
    );
}
// src/components/atoms/Input/Input.jsx
"use client";
import { Styles } from "./Input.module.css";

export default function Input({ type, placeholder, value, onChange }) {
    return <input className={Styles.input} type={type} placeholder={placeholder} value={value} onChange={onChange} />;
}
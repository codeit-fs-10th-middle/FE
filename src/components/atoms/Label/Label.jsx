// src/components/atoms/Label/Label.jsx
"use client";
import { Styles } from "./Label.module.css";

export default function Label({ children }) {
    return <label className={Styles.label}>{children}</label>;
}

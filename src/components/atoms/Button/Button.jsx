// src/components/atoms/Button/Button.jsx
"use client";

import { useRouter } from "next/navigation";
import styles from "./Button.module.css";

export default function Button({ children, href, onClick, className, style, disabled, type = "button" }) {
    const router = useRouter();

    const handleClick = () => {
        if (disabled) return;
        if (onClick) return onClick();
        if (href) return router.push(href);
    };

    return (
        <button
            type={type}
            className={`${styles.button ?? ''} ${className ?? ''}`.trim()}
            onClick={handleClick}
            style={style}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
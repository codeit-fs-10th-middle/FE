// src/components/molecules/InputPassword/InputPassword.jsx

"use client";

import { Input } from "../../atoms/Input";
import { Button } from "../../atoms/Button";
import styles from "./InputPassword.module.css";
import PropTypes from "prop-types";
import Image from "next/image";

export default function InputPassword({ 
    placeholder, 
    value, 
    onChange, 
    onShowPassword, 
    onHidePassword, 
    className 
}) {
    return (
        <div 
            className={`${styles.inputPassword} ${className}`}
        >
            <Input 
                className={styles.input} 
                type="password" 
                placeholder={placeholder} 
                value={value} 
                onChange={onChange} 
            />
            <Button 
                className={styles.button}
                onClick={onShowPassword}
            >
                <Image src="/assets/icons/ic_eye_on.svg" 
                    alt="eye-on" className={styles.iconEyeOn} 
                    width={20} 
                    height={20} 
                />
            </Button>
            <Button 
                className={styles.button} 
                onClick={onHidePassword}
            >
                <Image 
                    src="/assets/icons/ic_eye_off.svg" 
                    alt="eye-off" 
                    className={styles.iconEyeOff} 
                    width={20} 
                    height={20} 
                />
            </Button>
        </div>
    );
}

InputPassword.propTypes = {
    placeholder: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    onShowPassword: PropTypes.func.isRequired,
    onHidePassword: PropTypes.func.isRequired,
};

InputPassword.defaultProps = {
    placeholder: "Password",
    value: "",
    onChange: () => {},
    className: "",
    onShowPassword: () => {},
    onHidePassword: () => {},
};


'use client';

import styles from './InputSearch.module.css';
import Input from '../../atoms/Input/Input';
import Button from '../../atoms/Button/Button';
import Image from 'next/image';
import SearchIcon from '../../../public/assets/icons/ic_search.svg';

export default function InputSearch({
    placeholder,
    value,
    onChange,
    className,
    error,
    required,
    id,
    disabled,
    icon = <Image src={SearchIcon} alt="search" width={20} height={20} />
}) {
    return (
        <div className={`${styles.inputSearch} ${className}`}>
            <Input 
                type="text" 
                placeholder={placeholder} 
                value={value} 
                onChange={onChange}
                className={`${styles.input} ${className} ${error ? styles.error : ''}`}
                error={error}
                required={required}
                id={id}
                disabled={disabled}
            />
            <Button 
                className={`${styles.button} ${className} ${error ? styles.error : ''}`} 
                onClick={onClick}
                error={error}
                required={required}
                id={id}
                disabled={disabled}
            >
                {icon}
            </Button>
            {error && <p className={styles.errorMessage}>{error}</p>}
        </div>
    );
}
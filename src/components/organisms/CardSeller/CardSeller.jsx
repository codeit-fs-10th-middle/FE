'use client';

import styles from './CardSeller.module.css';
import Image from 'next/image';
import Label from '../../atoms/Label/Label';
import Button from '../../atoms/Button/Button';

export default function CardSeller({
    rarity = 'COMMON',
    category = '풍경',
    owner = '미쓰손',
    description = '우리집 앞마당 포토카드입니다. 우리집 앞마당 포토카드입니다. 우리집 앞마당 포토카드입니다.',
    price = '4 P',
    remaining = '2 / 5',
    secondRarity = 'RARE',
    secondCategory = '풍경',
    secondDescription = '푸릇푸릇한 여름 풍경, 눈 많이 내린 겨울 풍경 사진에 관심이 많습니다.',
    onEdit,
    onTakeDown,
}) {

    return (
        <div className={styles.cardSellerContainer}>
            <div className={styles.cardSeller}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <span className={styles.rarity}>{rarity}</span>
                        <span className={styles.separator}>|</span>
                        <span className={styles.category}>{category}</span>
                    </div>
                    <span className={styles.owner}>{owner}</span>
                </div>

                {/* Description */}
                <div className={styles.description}>{description}</div>

                {/* Price and Remaining */}
                <div className={styles.infoRow}>
                    <div className={styles.infoItem}>
                        <Label>가격</Label>
                        <div className={styles.infoValue}>{price}</div>
                    </div>
                    <div className={styles.infoItem}>
                        <Label>잔여</Label>
                        <div className={styles.infoValue}>{remaining}</div>
                    </div>
                </div>

                {/* Exchange Wish Info */}
                <div className={styles.exchangeWishBox}>
                    <Image src="/assets/icons/ic_refresh.svg" alt="exchange" width={28} height={28} />
                    <span className={styles.exchangeWishText}>교환 희망 정보</span>
                </div>

                <div className={styles.divider}></div>

                {/* Second Header */}
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <span className={styles.secondRarity}>{secondRarity}</span>
                        <span className={styles.separator}>|</span>
                        <span className={styles.category}>{secondCategory}</span>
                    </div>
                </div>

                {/* Second Description */}
                <div className={styles.description}>{secondDescription}</div>

                <div className={styles.divider}></div>

                {/* Action Buttons */}
                <Button className={styles.editButton} onClick={onEdit}>
                    수정하기
                </Button>
                <Button className={styles.takeDownButton} onClick={onTakeDown}>
                    판매 내리기
                </Button>
            </div>
        </div>    
    );
}
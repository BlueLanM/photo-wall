import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { gsap } from "gsap";
import "./BounceCards.css";

export default function BounceCards({
	className = "",
	images = [],
	containerWidth = 400,
	containerHeight = 400,
	animationDelay = 0.5,
	animationStagger = 0.06,
	easeType = "elastic.out(1, 0.8)",
	transformStyles = null,
	enableHover = true
}) {
	const containerRef = useRef(null);
	const [isMobile, setIsMobile] = useState(false);
	const [touchedCard, setTouchedCard] = useState(null);

	// 检测是否为移动设备
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth <= 768);
		};
		
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// 自动生成 transformStyles，如果没有提供的话
	const getDefaultTransformStyles = (count) => {
		if (count === 0) return [];
		if (count === 1) return ["rotate(0deg)"];

		const styles = [];
		
		if (isMobile) {
			// 移动端：创建凌乱的卡片布局
			const screenWidth = window.innerWidth;
			const cardWidth = screenWidth <= 480 ? 100 : 120;
			const padding = 20;
			const availableWidth = screenWidth - padding * 2 - cardWidth;
			
			// 每行最多放置的卡片数（根据屏幕宽度动态计算）
			const spacing = 50; // 卡片间距
			const cardsPerRow = Math.floor((availableWidth + cardWidth) / (cardWidth * 0.7 + spacing)) || 1;
			
			for (let i = 0; i < count; i++) {
				const row = Math.floor(i / cardsPerRow);
				const col = i % cardsPerRow;
				const colsInThisRow = Math.min(cardsPerRow, count - row * cardsPerRow);
				
				// 计算水平偏移（居中显示当前行的卡片）
				const rowWidth = (colsInThisRow - 1) * spacing;
				const startX = -rowWidth / 2;
				const offsetX = startX + col * spacing;
				
				// 计算垂直偏移，营造错落感
				const baseOffsetY = row * 80; // 行间距
				const randomOffsetY = (Math.sin(i * 2.5) * 20); // 添加轻微的随机垂直偏移
				const offsetY = baseOffsetY + randomOffsetY;
				
				// 旋转角度：更加随机和自然
				const rotation = (Math.sin(i * 1.5) * 8) + (col - (colsInThisRow - 1) / 2) * 3;
				
				styles.push(`rotate(${rotation}deg) translate(${offsetX}px, ${offsetY}px)`);
			}
		} else {
			// 桌面端：保持原有的扇形布局
			const spacing = 170;
			const totalWidth = (count - 1) * spacing;
			const startOffset = -totalWidth / 2;

			for (let i = 0; i < count; i++) {
				const offset = startOffset + i * spacing;
				const rotationMultiplier = count <= 5 ? 5 : 3;
				const rotation = (i - (count - 1) / 2) * rotationMultiplier;
				styles.push(`rotate(${rotation}deg) translate(${offset}px)`);
			}
		}

		return styles;
	};

	const finalTransformStyles = transformStyles || getDefaultTransformStyles(images.length);

	// 根据设备类型调整推开距离
	const getPushOffset = () => isMobile ? 80 : 160;

	useEffect(() => {
		const ctx = gsap.context(() => {
			if (isMobile) {
				// 移动端：从各自的位置以更自然的方式出现
				gsap.fromTo(
					".card",
					{ 
						opacity: 0,
						scale: 0.5,
						rotateZ: "+=15" // 添加一点额外的旋转
					},
					{
						delay: animationDelay,
						duration: 0.6,
						ease: "back.out(1.5)",
						opacity: 1,
						scale: 1,
						rotateZ: "-=15", // 恢复到原始旋转角度
						stagger: {
							amount: 0.3,
						
						}
					}
				);
			} else {
				// 桌面端：保持原有的弹性动画
				gsap.fromTo(
					".card",
					{ scale: 0 },
					{
						delay: animationDelay,
						ease: easeType,
						scale: 1,
						stagger: animationStagger
					}
				);
			}
		}, containerRef);
		return () => ctx.revert();
	}, [animationStagger, easeType, animationDelay, isMobile]);

	const getNoRotationTransform = transformStr => {
		const hasRotate = /rotate\([\s\S]*?\)/.test(transformStr);
		if (hasRotate) {
			return transformStr.replace(/rotate\([\s\S]*?\)/, "rotate(0deg)");
		} else if (transformStr === "none") {
			return "rotate(0deg)";
		} else {
			return `${transformStr} rotate(0deg)`;
		}
	};

	const getPushedTransform = (baseTransform, offsetX) => {
		const translateRegex = /translate\(([-0-9.]+)px\)/;
		const match = baseTransform.match(translateRegex);
		if (match) {
			const currentX = parseFloat(match[1]);
			const newX = currentX + offsetX;
			return baseTransform.replace(translateRegex, `translate(${newX}px)`);
		} else {
			return baseTransform === "none" ? `translate(${offsetX}px)` : `${baseTransform} translate(${offsetX}px)`;
		}
	};

	const pushSiblings = hoveredIdx => {
		if (!enableHover || !containerRef.current) return;

		const q = gsap.utils.selector(containerRef);

		images.forEach((_, i) => {
			const target = q(`.card-${i}`);
			gsap.killTweensOf(target);

			const baseTransform = finalTransformStyles[i] || "none";

			if (i === hoveredIdx) {
				const noRotationTransform = getNoRotationTransform(baseTransform);
				gsap.to(target, {
					duration: 0.4,
					ease: "back.out(1.4)",
					overwrite: "auto",
					transform: noRotationTransform
				});
			} else {
				const offsetX = i < hoveredIdx ? -getPushOffset() : getPushOffset();
				const pushedTransform = getPushedTransform(baseTransform, offsetX);

				const distance = Math.abs(hoveredIdx - i);
				const delay = distance * 0.05;

				gsap.to(target, {
					delay,
					duration: 0.4,
					ease: "back.out(1.4)",
					overwrite: "auto",
					transform: pushedTransform
				});
			}
		});
	};

	const resetSiblings = () => {
		if (!enableHover || !containerRef.current) return;

		const q = gsap.utils.selector(containerRef);

		images.forEach((_, i) => {
			const target = q(`.card-${i}`);
			gsap.killTweensOf(target);
			const baseTransform = finalTransformStyles[i] || "none";
			gsap.to(target, {
				duration: 0.4,
				ease: "back.out(1.4)",
				overwrite: "auto",
				transform: baseTransform
			});
		});
	};

	// 处理触摸事件（移动端）
	const handleTouchStart = (idx) => {
		if (isMobile) {
			setTouchedCard(idx);
			pushSiblings(idx);
		}
	};

	const handleTouchEnd = () => {
		if (isMobile) {
			setTimeout(() => {
				setTouchedCard(null);
				resetSiblings();
			}, 300);
		}
	};

	return (
		<div
			className={`bouncecrdscontainer ${className} ${isMobile ? "mobile" : ""}`}
			ref={containerRef}
			style={{
				height: isMobile ? "auto" : containerHeight,
				position: "relative",
				width: isMobile ? "100%" : containerWidth,
				minHeight: isMobile ? "250px" : containerHeight
			}}
		>
			{images.map((src, idx) => (
				<div
					key={idx}
					className={`card card-${idx} ${touchedCard === idx ? "touched" : ""}`}
					style={{
						transform: finalTransformStyles[idx] ?? "none"
					}}
					onMouseEnter={() => !isMobile && pushSiblings(idx)}
					onMouseLeave={() => !isMobile && resetSiblings()}
					onTouchStart={() => handleTouchStart(idx)}
					onTouchEnd={handleTouchEnd}
				>
					<img className="image" src={src} alt={`card-${idx}`} />
				</div>
			))}
		</div>
	);
}

BounceCards.propTypes = {
	animationDelay: PropTypes.number,
	animationStagger: PropTypes.number,
	className: PropTypes.string,
	containerHeight: PropTypes.number,
	containerWidth: PropTypes.number,
	easeType: PropTypes.string,
	enableHover: PropTypes.bool,
	images: PropTypes.arrayOf(PropTypes.string),
	transformStyles: PropTypes.arrayOf(PropTypes.string)
};
import { useEffect, useRef } from "react";
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

	// 自动生成 transformStyles，如果没有提供的话
	const getDefaultTransformStyles = (count) => {
		if (count === 0) return [];
		if (count === 1) return ["rotate(0deg)"];

		const styles = [];
		const spacing = 170; // 每张卡片之间的间距
		const totalWidth = (count - 1) * spacing;
		const startOffset = -totalWidth / 2;

		for (let i = 0; i < count; i++) {
			const offset = startOffset + i * spacing;
			const rotation = (i - (count - 1) / 2) * (count <= 5 ? 5 : 3); // 根据数量调整旋转角度
			styles.push(`rotate(${rotation}deg) translate(${offset}px)`);
		}

		return styles;
	};

	const finalTransformStyles = transformStyles || getDefaultTransformStyles(images.length);

	useEffect(() => {
		const ctx = gsap.context(() => {
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
		}, containerRef);
		return () => ctx.revert();
	}, [animationStagger, easeType, animationDelay]);

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
				const offsetX = i < hoveredIdx ? -160 : 160;
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

	return (
		<div
			className={`bouncecrdscontainer ${className}`}
			ref={containerRef}
			style={{
				height: containerHeight,
				position: "relative",
				width: containerWidth
			}}
		>
			{images.map((src, idx) => (
				<div
					key={idx}
					className={`card card-${idx}`}
					style={{
						transform: finalTransformStyles[idx] ?? "none"
					}}
					onMouseEnter={() => pushSiblings(idx)}
					onMouseLeave={resetSiblings}
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
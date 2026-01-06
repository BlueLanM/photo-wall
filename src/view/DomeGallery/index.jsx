import { useEffect, useMemo, useRef, useCallback, memo, useState } from "react";
import { useGesture } from "@use-gesture/react";
import PropTypes from "prop-types";
import "./index.css";

// 使用动态导入优化初始加载
const getLocalImage = (num) => {
	return new URL(`../../assets/${num}.jpg`, import.meta.url).href;
};

const DEFAULT_IMAGES = [
	{
		alt: "澳门",
		src: "https://bluelanm.github.io/my-website/assets/images/aomen2-b0266e0c9ee37dc165f75d77ea2bab1d.jpg"
	},
	{
		alt: "澳门",
		src: "https://bluelanm.github.io/my-website/assets/images/aomen4-85f830ade546825f059c11dad3b46cd8.jpg"
	},
	{
		alt: "澳门",
		src: "https://bluelanm.github.io/my-website/assets/images/aomen1-073f971d13c42e42a8621dd54394ef9c.jpg"
	},
	{
		alt: "厦门",
		src: "https://bluelanm.github.io/my-website/assets/images/xiamen1-71449773d73cbb905977cc5a554f8679.jpg"
	},
	{
		alt: "香港",
		src: "https://bluelanm.github.io/my-website/assets/images/hongkong3-8ed3ddea810cb5c0bf776520933ece76.jpg"
	},
	{
		alt: "香港",
		src: "https://bluelanm.github.io/my-website/assets/images/hongkong1-391ef275fd2bfccfbd5d901d3734c99b.jpg"
	},
	{
		alt: "香港",
		src: "https://bluelanm.github.io/my-website/assets/images/hongkong5-eb052dc31d4a5f9aae145ebf1b93b3b6.jpg"
	},
	{
		alt: "戒指",
		src: "https://bluelanm.github.io/my-website/assets/images/ring-da10a9d588709ee29ee0eb842145be7e.jpg"
	},
	{ alt: "珠海", src: getLocalImage(1) },
	{ alt: "珠海", src: getLocalImage(2) },
	{ alt: "珠海", src: getLocalImage(3) },
	{ alt: "珠海", src: getLocalImage(4) },
	{ alt: "云南", src: getLocalImage(5) },
	{ alt: "云南", src: getLocalImage(6) },
	{ alt: "云南", src: getLocalImage(7) },
	{ alt: "云南", src: getLocalImage(8) },
	{ alt: "云南", src: getLocalImage(9) },
	{ alt: "云南", src: getLocalImage(10) },
	{ alt: "云南", src: getLocalImage(11) },
	{ alt: "云南", src: getLocalImage(12) },
	{ alt: "云南", src: getLocalImage(13) },
	{ alt: "云南", src: getLocalImage(14) },
	{ alt: "云南", src: getLocalImage(15) },
	{ alt: "云南", src: getLocalImage(16) },
	{ alt: "云南", src: getLocalImage(17) }
];

const DEFAULTS = {
	dragSensitivity: 20,
	enlargeTransitionMs: 300,
	maxVerticalRotationDeg: 5,
	segments: 35 // 从 35 减少到 22，大幅提升性能
};

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const normalizeAngle = d => ((d % 360) + 360) % 360;
const wrapAngleSigned = deg => {
	const a = (((deg + 180) % 360) + 360) % 360;
	return a - 180;
};
const getDataNumber = (el, name, fallback) => {
	const attr = el.dataset[name] ?? el.getAttribute(`data-${name}`);
	const n = attr == null ? NaN : parseFloat(attr);
	return Number.isFinite(n) ? n : fallback;
};

// 防抖函数
const debounce = (fn, delay) => {
	let timeoutId;
	return (...args) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn(...args), delay);
	};
};

// 优化的图片组件 - 使用 memo 避免不必要的重渲染
const GalleryImage = memo(({ src, alt, onTileClick, onTilePointerUp }) => {
	const [isLoaded, setIsLoaded] = useState(false);
	const [shouldLoad, setShouldLoad] = useState(false);
	const imgRef = useRef(null);

	useEffect(() => {
		// 使用 IntersectionObserver 实现懒加载
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setShouldLoad(true);
						observer.disconnect();
					}
				});
			},
			{
				rootMargin: "200px" // 提前 200px 开始加载
			}
		);

		if (imgRef.current) {
			observer.observe(imgRef.current);
		}

		return () => observer.disconnect();
	}, []);

	return (
		<div
			ref={imgRef}
			className="item__image"
			role="button"
			tabIndex={0}
			aria-label={alt || "Open image"}
			onClick={onTileClick}
			onPointerUp={onTilePointerUp}
		>
			{shouldLoad && (
				<img
					src={src}
					draggable={false}
					alt={alt}
					loading="lazy"
					onLoad={() => setIsLoaded(true)}
					style={{
						opacity: isLoaded ? 1 : 0,
						transition: "opacity 0.3s ease-in-out"
					}}
				/>
			)}
		</div>
	);
});

GalleryImage.displayName = "GalleryImage";
GalleryImage.propTypes = {
	src: PropTypes.string.isRequired,
	alt: PropTypes.string,
	onTileClick: PropTypes.func.isRequired,
	onTilePointerUp: PropTypes.func.isRequired
};

function buildItems(pool, seg) {
	const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
	const evenYs = [-4, -2, 0, 2, 4];
	const oddYs = [-3, -1, 1, 3, 5];

	const coords = xCols.flatMap((x, c) => {
		const ys = c % 2 === 0 ? evenYs : oddYs;
		return ys.map(y => ({ sizeX: 2, sizeY: 2, x, y }));
	});

	const totalSlots = coords.length;
	if (pool.length === 0) {
		return coords.map(c => ({ ...c, alt: "", src: "" }));
	}
	if (pool.length > totalSlots) {
		console.warn(
			`[DomeGallery] Provided image count (${pool.length}) exceeds available tiles (${totalSlots}). Some images will not be shown.`
		);
	}

	const normalizedImages = pool.map(image => {
		if (typeof image === "string") {
			return { alt: "", src: image };
		}
		return { alt: image.alt || "", src: image.src || "" };
	});

	const usedImages = Array.from({ length: totalSlots }, (_, i) => normalizedImages[i % normalizedImages.length]);

	for (let i = 1; i < usedImages.length; i++) {
		if (usedImages[i].src === usedImages[i - 1].src) {
			for (let j = i + 1; j < usedImages.length; j++) {
				if (usedImages[j].src !== usedImages[i].src) {
					const tmp = usedImages[i];
					usedImages[i] = usedImages[j];
					usedImages[j] = tmp;
					break;
				}
			}
		}
	}

	return coords.map((c, i) => ({
		...c,
		alt: usedImages[i].alt,
		src: usedImages[i].src
	}));
}

function computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments) {
	const unit = 360 / segments / 2;
	const rotateY = unit * (offsetX + (sizeX - 1) / 2);
	const rotateX = unit * (offsetY - (sizeY - 1) / 2);
	return { rotateX, rotateY };
}

export default function DomeGallery({
	images = DEFAULT_IMAGES,
	fit = 0.5,
	fitBasis = "auto",
	minRadius = 600,
	maxRadius = Infinity,
	padFactor = 0.25,
	overlayBlurColor = "#060010",
	maxVerticalRotationDeg = DEFAULTS.maxVerticalRotationDeg,
	dragSensitivity = DEFAULTS.dragSensitivity,
	enlargeTransitionMs = DEFAULTS.enlargeTransitionMs,
	segments = DEFAULTS.segments,
	dragDampening = 2,
	openedImageWidth = "400px",
	openedImageHeight = "500px",
	imageBorderRadius = "30px",
	openedImageBorderRadius = "30px",
	grayscale = true
}) {
	const rootRef = useRef(null);
	const mainRef = useRef(null);
	const sphereRef = useRef(null);
	const frameRef = useRef(null);
	const viewerRef = useRef(null);
	const scrimRef = useRef(null);
	const focusedElRef = useRef(null);
	const originalTilePositionRef = useRef(null);

	const rotationRef = useRef({ x: 0, y: 0 });
	const startRotRef = useRef({ x: 0, y: 0 });
	const startPosRef = useRef(null);
	const draggingRef = useRef(false);
	const movedRef = useRef(false);
	const inertiaRAF = useRef(null);
	const openingRef = useRef(false);
	const openStartedAtRef = useRef(0);
	const lastDragEndAt = useRef(0);

	const scrollLockedRef = useRef(false);
	const lockScroll = useCallback(() => {
		if (scrollLockedRef.current) return;
		scrollLockedRef.current = true;
		document.body.classList.add("dg-scroll-lock");
	}, []);
	const unlockScroll = useCallback(() => {
		if (!scrollLockedRef.current) return;
		if (rootRef.current?.getAttribute("data-enlarging") === "true") return;
		scrollLockedRef.current = false;
		document.body.classList.remove("dg-scroll-lock");
	}, []);

	const items = useMemo(() => buildItems(images, segments), [images, segments]);

	const applyTransform = (xDeg, yDeg) => {
		const el = sphereRef.current;
		if (el) {
			el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
		}
	};

	const lockedRadiusRef = useRef(null);

	useEffect(() => {
		const root = rootRef.current;
		if (!root) return;
		
		// 使用防抖优化 ResizeObserver
		const handleResize = debounce((entries) => {
			const cr = entries[0].contentRect;
			const w = Math.max(1, cr.width);
			const h = Math.max(1, cr.height);
			const minDim = Math.min(w, h);
			const maxDim = Math.max(w, h);
			const aspect = w / h;
			let basis;
			switch (fitBasis) {
			case "min":
				basis = minDim;
				break;
			case "max":
				basis = maxDim;
				break;
			case "width":
				basis = w;
				break;
			case "height":
				basis = h;
				break;
			default:
				basis = aspect >= 1.3 ? w : minDim;
			}
			let radius = basis * fit;
			const heightGuard = h * 1.35;
			radius = Math.min(radius, heightGuard);
			radius = clamp(radius, minRadius, maxRadius);
			lockedRadiusRef.current = Math.round(radius);

			const viewerPad = Math.max(8, Math.round(minDim * padFactor));
			root.style.setProperty("--radius", `${lockedRadiusRef.current}px`);
			root.style.setProperty("--viewer-pad", `${viewerPad}px`);
			root.style.setProperty("--overlay-blur-color", overlayBlurColor);
			root.style.setProperty("--tile-radius", imageBorderRadius);
			root.style.setProperty("--enlarge-radius", openedImageBorderRadius);
			root.style.setProperty("--image-filter", grayscale ? "grayscale(1)" : "none");
			applyTransform(rotationRef.current.x, rotationRef.current.y);

			const enlargedOverlay = viewerRef.current?.querySelector(".enlarge");
			if (enlargedOverlay && frameRef.current && mainRef.current) {
				const frameR = frameRef.current.getBoundingClientRect();
				const mainR = mainRef.current.getBoundingClientRect();

				const hasCustomSize = openedImageWidth && openedImageHeight;
				if (hasCustomSize) {
					const tempDiv = document.createElement("div");
					tempDiv.style.cssText = `position: absolute; width: ${openedImageWidth}; height: ${openedImageHeight}; visibility: hidden;`;
					document.body.appendChild(tempDiv);
					const tempRect = tempDiv.getBoundingClientRect();
					document.body.removeChild(tempDiv);

					const centeredLeft = frameR.left - mainR.left + (frameR.width - tempRect.width) / 2;
					const centeredTop = frameR.top - mainR.top + (frameR.height - tempRect.height) / 2;

					enlargedOverlay.style.left = `${centeredLeft}px`;
					enlargedOverlay.style.top = `${centeredTop}px`;
				} else {
					enlargedOverlay.style.left = `${frameR.left - mainR.left}px`;
					enlargedOverlay.style.top = `${frameR.top - mainR.top}px`;
					enlargedOverlay.style.width = `${frameR.width}px`;
					enlargedOverlay.style.height = `${frameR.height}px`;
				}
			}
		}, 100); // 100ms 防抖延迟

		const ro = new ResizeObserver(handleResize);
		ro.observe(root);
		
		return () => {
			ro.disconnect();
		};
	}, [
		fit,
		fitBasis,
		minRadius,
		maxRadius,
		padFactor,
		overlayBlurColor,
		grayscale,
		imageBorderRadius,
		openedImageBorderRadius,
		openedImageWidth,
		openedImageHeight
	]);

	useEffect(() => {
		applyTransform(rotationRef.current.x, rotationRef.current.y);
	}, []);

	const stopInertia = useCallback(() => {
		if (inertiaRAF.current) {
			cancelAnimationFrame(inertiaRAF.current);
			inertiaRAF.current = null;
		}
	}, []);

	const startInertia = useCallback(
		(vx, vy) => {
			const MAX_V = 1.4;
			let vX = clamp(vx, -MAX_V, MAX_V) * 80;
			let vY = clamp(vy, -MAX_V, MAX_V) * 80;
			let frames = 0;
			const d = clamp(dragDampening ?? 0.6, 0, 1);
			const frictionMul = 0.94 + 0.055 * d;
			const stopThreshold = 0.015 - 0.01 * d;
			const maxFrames = Math.round(90 + 270 * d);
			const step = () => {
				vX *= frictionMul;
				vY *= frictionMul;
				if (Math.abs(vX) < stopThreshold && Math.abs(vY) < stopThreshold) {
					inertiaRAF.current = null;
					return;
				}
				if (++frames > maxFrames) {
					inertiaRAF.current = null;
					return;
				}
				const nextX = clamp(rotationRef.current.x - vY / 200, -maxVerticalRotationDeg, maxVerticalRotationDeg);
				const nextY = wrapAngleSigned(rotationRef.current.y + vX / 200);
				rotationRef.current = { x: nextX, y: nextY };
				applyTransform(nextX, nextY);
				inertiaRAF.current = requestAnimationFrame(step);
			};
			stopInertia();
			inertiaRAF.current = requestAnimationFrame(step);
		},
		[dragDampening, maxVerticalRotationDeg, stopInertia]
	);

	useGesture(
		{
			onDrag: ({ event, last, velocity = [0, 0], direction = [0, 0], movement }) => {
				if (focusedElRef.current || !draggingRef.current || !startPosRef.current) return;
				const evt = event;
				const dxTotal = evt.clientX - startPosRef.current.x;
				const dyTotal = evt.clientY - startPosRef.current.y;
				if (!movedRef.current) {
					const dist2 = dxTotal * dxTotal + dyTotal * dyTotal;
					if (dist2 > 16) movedRef.current = true;
				}
				const nextX = clamp(
					startRotRef.current.x - dyTotal / dragSensitivity,
					-maxVerticalRotationDeg,
					maxVerticalRotationDeg
				);
				const nextY = wrapAngleSigned(startRotRef.current.y + dxTotal / dragSensitivity);
				if (rotationRef.current.x !== nextX || rotationRef.current.y !== nextY) {
					rotationRef.current = { x: nextX, y: nextY };
					applyTransform(nextX, nextY);
				}
				if (last) {
					draggingRef.current = false;
					const [vMagX, vMagY] = velocity;
					const [dirX, dirY] = direction;
					let vx = vMagX * dirX;
					let vy = vMagY * dirY;
					if (Math.abs(vx) < 0.001 && Math.abs(vy) < 0.001 && Array.isArray(movement)) {
						const [mx, my] = movement;
						vx = clamp((mx / dragSensitivity) * 0.02, -1.2, 1.2);
						vy = clamp((my / dragSensitivity) * 0.02, -1.2, 1.2);
					}
					if (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005) startInertia(vx, vy);
					if (movedRef.current) lastDragEndAt.current = performance.now();
					movedRef.current = false;
				}
			},
			onDragStart: ({ event }) => {
				if (focusedElRef.current) return;
				stopInertia();
				const evt = event;
				draggingRef.current = true;
				movedRef.current = false;
				startRotRef.current = { ...rotationRef.current };
				startPosRef.current = { x: evt.clientX, y: evt.clientY };
			}
		},
		{ eventOptions: { passive: true }, target: mainRef }
	);

	useEffect(() => {
		const scrim = scrimRef.current;
		if (!scrim) return;
		const close = () => {
			if (performance.now() - openStartedAtRef.current < 250) return;
			const el = focusedElRef.current;
			if (!el) return;
			const parent = el.parentElement;
			const overlay = viewerRef.current?.querySelector(".enlarge");
			if (!overlay) return;
			const refDiv = parent.querySelector(".item__image--reference");
			const originalPos = originalTilePositionRef.current;
			if (!originalPos) {
				overlay.remove();
				if (refDiv) refDiv.remove();
				parent.style.setProperty("--rot-y-delta", "0deg");
				parent.style.setProperty("--rot-x-delta", "0deg");
				el.style.visibility = "";
				el.style.zIndex = 0;
				focusedElRef.current = null;
				rootRef.current?.removeAttribute("data-enlarging");
				openingRef.current = false;
				unlockScroll();
				return;
			}
			const currentRect = overlay.getBoundingClientRect();
			const rootRect = rootRef.current.getBoundingClientRect();
			const originalPosRelativeToRoot = {
				height: originalPos.height,
				left: originalPos.left - rootRect.left,
				top: originalPos.top - rootRect.top,
				width: originalPos.width
			};
			const overlayRelativeToRoot = {
				height: currentRect.height,
				left: currentRect.left - rootRect.left,
				top: currentRect.top - rootRect.top,
				width: currentRect.width
			};
			const animatingOverlay = document.createElement("div");
			animatingOverlay.className = "enlarge-closing";
			animatingOverlay.style.cssText = `position:absolute;left:${overlayRelativeToRoot.left}px;top:${overlayRelativeToRoot.top}px;width:${overlayRelativeToRoot.width}px;height:${overlayRelativeToRoot.height}px;z-index:9999;border-radius: var(--enlarge-radius, 32px);overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.35);transition:all ${enlargeTransitionMs}ms ease-out;pointer-events:none;margin:0;transform:none;`;
			const originalImg = overlay.querySelector("img");
			if (originalImg) {
				const img = originalImg.cloneNode();
				img.style.cssText = "width:100%;height:100%;object-fit:cover;";
				animatingOverlay.appendChild(img);
			}
			overlay.remove();
			rootRef.current.appendChild(animatingOverlay);
			// Force reflow
			const _reflow1 = animatingOverlay.getBoundingClientRect();
			console.log(_reflow1);
			requestAnimationFrame(() => {
				animatingOverlay.style.left = originalPosRelativeToRoot.left + "px";
				animatingOverlay.style.top = originalPosRelativeToRoot.top + "px";
				animatingOverlay.style.width = originalPosRelativeToRoot.width + "px";
				animatingOverlay.style.height = originalPosRelativeToRoot.height + "px";
				animatingOverlay.style.opacity = "0";
			});
			const cleanup = () => {
				animatingOverlay.remove();
				originalTilePositionRef.current = null;
				if (refDiv) refDiv.remove();
				parent.style.transition = "none";
				el.style.transition = "none";
				parent.style.setProperty("--rot-y-delta", "0deg");
				parent.style.setProperty("--rot-x-delta", "0deg");
				requestAnimationFrame(() => {
					el.style.visibility = "";
					el.style.opacity = "0";
					el.style.zIndex = 0;
					focusedElRef.current = null;
					rootRef.current?.removeAttribute("data-enlarging");
					requestAnimationFrame(() => {
						parent.style.transition = "";
						el.style.transition = "opacity 300ms ease-out";
						requestAnimationFrame(() => {
							el.style.opacity = "1";
							setTimeout(() => {
								el.style.transition = "";
								el.style.opacity = "";
								openingRef.current = false;
								if (!draggingRef.current && rootRef.current?.getAttribute("data-enlarging") !== "true") { document.body.classList.remove("dg-scroll-lock"); }
							}, 300);
						});
					});
				});
			};
			animatingOverlay.addEventListener("transitionend", cleanup, { once: true });
		};
		scrim.addEventListener("click", close);
		const onKey = e => {
			if (e.key === "Escape") close();
		};
		window.addEventListener("keydown", onKey);
		return () => {
			scrim.removeEventListener("click", close);
			window.removeEventListener("keydown", onKey);
		};
	}, [enlargeTransitionMs, unlockScroll]);

	const openItemFromElement = useCallback(
		el => {
			if (openingRef.current) return;
			openingRef.current = true;
			openStartedAtRef.current = performance.now();
			lockScroll();
			const parent = el.parentElement;
			focusedElRef.current = el;
			el.setAttribute("data-focused", "true");
			const offsetX = getDataNumber(parent, "offsetX", 0);
			const offsetY = getDataNumber(parent, "offsetY", 0);
			const sizeX = getDataNumber(parent, "sizeX", 2);
			const sizeY = getDataNumber(parent, "sizeY", 2);
			const parentRot = computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments);
			const parentY = normalizeAngle(parentRot.rotateY);
			const globalY = normalizeAngle(rotationRef.current.y);
			let rotY = -(parentY + globalY) % 360;
			if (rotY < -180) rotY += 360;
			const rotX = -parentRot.rotateX - rotationRef.current.x;
			parent.style.setProperty("--rot-y-delta", `${rotY}deg`);
			parent.style.setProperty("--rot-x-delta", `${rotX}deg`);
			const refDiv = document.createElement("div");
			refDiv.className = "item__image item__image--reference";
			refDiv.style.opacity = "0";
			refDiv.style.transform = `rotateX(${-parentRot.rotateX}deg) rotateY(${-parentRot.rotateY}deg)`;
			parent.appendChild(refDiv);

			// Force reflow
			const _reflow2 = refDiv.offsetHeight;

			console.log(_reflow2);

			const tileR = refDiv.getBoundingClientRect();
			const mainR = mainRef.current?.getBoundingClientRect();
			const frameR = frameRef.current?.getBoundingClientRect();

			if (!mainR || !frameR || tileR.width <= 0 || tileR.height <= 0) {
				openingRef.current = false;
				focusedElRef.current = null;
				parent.removeChild(refDiv);
				unlockScroll();
				return;
			}

			originalTilePositionRef.current = { height: tileR.height, left: tileR.left, top: tileR.top, width: tileR.width };
			el.style.visibility = "hidden";
			el.style.zIndex = 0;
			const overlay = document.createElement("div");
			overlay.className = "enlarge";
			overlay.style.position = "absolute";
			overlay.style.left = frameR.left - mainR.left + "px";
			overlay.style.top = frameR.top - mainR.top + "px";
			overlay.style.width = frameR.width + "px";
			overlay.style.height = frameR.height + "px";
			overlay.style.opacity = "0";
			overlay.style.zIndex = "30";
			overlay.style.willChange = "transform, opacity";
			overlay.style.transformOrigin = "top left";
			overlay.style.transition = `transform ${enlargeTransitionMs}ms ease, opacity ${enlargeTransitionMs}ms ease`;
			const rawSrc = parent.dataset.src || el.querySelector("img")?.src || "";
			const img = document.createElement("img");
			img.src = rawSrc;
			overlay.appendChild(img);
			viewerRef.current.appendChild(overlay);
			const tx0 = tileR.left - frameR.left;
			const ty0 = tileR.top - frameR.top;
			const sx0 = tileR.width / frameR.width;
			const sy0 = tileR.height / frameR.height;

			const validSx0 = isFinite(sx0) && sx0 > 0 ? sx0 : 1;
			const validSy0 = isFinite(sy0) && sy0 > 0 ? sy0 : 1;

			overlay.style.transform = `translate(${tx0}px, ${ty0}px) scale(${validSx0}, ${validSy0})`;

			setTimeout(() => {
				if (!overlay.parentElement) return;
				overlay.style.opacity = "1";
				overlay.style.transform = "translate(0px, 0px) scale(1, 1)";
				rootRef.current?.setAttribute("data-enlarging", "true");
			}, 16);

			const wantsResize = openedImageWidth || openedImageHeight;
			if (wantsResize) {
				const onFirstEnd = ev => {
					if (ev.propertyName !== "transform") return;
					overlay.removeEventListener("transitionend", onFirstEnd);
					const prevTransition = overlay.style.transition;
					overlay.style.transition = "none";
					const tempWidth = openedImageWidth || `${frameR.width}px`;
					const tempHeight = openedImageHeight || `${frameR.height}px`;
					overlay.style.width = tempWidth;
					overlay.style.height = tempHeight;
					const newRect = overlay.getBoundingClientRect();
					overlay.style.width = frameR.width + "px";
					overlay.style.height = frameR.height + "px";
					// Force reflow
					const _reflow3 = overlay.offsetWidth;
					console.log(_reflow3);
					overlay.style.transition = `left ${enlargeTransitionMs}ms ease, top ${enlargeTransitionMs}ms ease, width ${enlargeTransitionMs}ms ease, height ${enlargeTransitionMs}ms ease`;
					const centeredLeft = frameR.left - mainR.left + (frameR.width - newRect.width) / 2;
					const centeredTop = frameR.top - mainR.top + (frameR.height - newRect.height) / 2;
					requestAnimationFrame(() => {
						overlay.style.left = `${centeredLeft}px`;
						overlay.style.top = `${centeredTop}px`;
						overlay.style.width = tempWidth;
						overlay.style.height = tempHeight;
					});
					const cleanupSecond = () => {
						overlay.removeEventListener("transitionend", cleanupSecond);
						overlay.style.transition = prevTransition;
					};
					overlay.addEventListener("transitionend", cleanupSecond, { once: true });
				};
				overlay.addEventListener("transitionend", onFirstEnd);
			}
		},
		[enlargeTransitionMs, lockScroll, openedImageHeight, openedImageWidth, segments, unlockScroll]
	);

	const onTileClick = useCallback(
		e => {
			if (draggingRef.current) return;
			if (movedRef.current) return;
			if (performance.now() - lastDragEndAt.current < 80) return;
			if (openingRef.current) return;
			openItemFromElement(e.currentTarget);
		},
		[openItemFromElement]
	);

	const onTilePointerUp = useCallback(
		e => {
			if (e.pointerType !== "touch") return;
			if (draggingRef.current) return;
			if (movedRef.current) return;
			if (performance.now() - lastDragEndAt.current < 80) return;
			if (openingRef.current) return;
			openItemFromElement(e.currentTarget);
		},
		[openItemFromElement]
	);

	useEffect(() => {
		return () => {
			document.body.classList.remove("dg-scroll-lock");
		};
	}, []);

	return (
		<div
			ref={rootRef}
			className="sphere-root"
			style={{
				"--enlarge-radius": openedImageBorderRadius,
				"--image-filter": grayscale ? "grayscale(1)" : "none",
				"--overlay-blur-color": overlayBlurColor,
				"--segments-x": segments,
				"--segments-y": segments,
				"--tile-radius": imageBorderRadius
			}}
		>
			<main ref={mainRef} className="sphere-main">
				<div className="stage">
					<div ref={sphereRef} className="sphere">
						{items.map((it, i) => (
							<div
								key={`${it.x},${it.y},${i}`}
								className="item"
								data-src={it.src}
								data-offset-x={it.x}
								data-offset-y={it.y}
								data-size-x={it.sizeX}
								data-size-y={it.sizeY}
								style={{
									"--item-size-x": it.sizeX,
									"--item-size-y": it.sizeY,
									"--offset-x": it.x,
									"--offset-y": it.y
								}}
							>
								<GalleryImage
									src={it.src}
									alt={it.alt}
									onTileClick={onTileClick}
									onTilePointerUp={onTilePointerUp}
								/>
							</div>
						))}
					</div>
				</div>

				<div className="overlay" />
				<div className="overlay overlay--blur" />
				<div className="edge-fade edge-fade--top" />
				<div className="edge-fade edge-fade--bottom" />

				<div className="viewer" ref={viewerRef}>
					<div ref={scrimRef} className="scrim" />
					<div ref={frameRef} className="frame" />
				</div>
			</main>
		</div>
	);
}

DomeGallery.propTypes = {
	dragDampening: PropTypes.number,
	dragSensitivity: PropTypes.number,
	enlargeTransitionMs: PropTypes.number,
	fit: PropTypes.number,
	fitBasis: PropTypes.oneOf(["auto", "min", "max", "width", "height"]),
	grayscale: PropTypes.bool,
	imageBorderRadius: PropTypes.string,
	images: PropTypes.arrayOf(
		PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.shape({
				alt: PropTypes.string,
				src: PropTypes.string.isRequired
			})
		])
	),
	maxRadius: PropTypes.number,
	maxVerticalRotationDeg: PropTypes.number,
	minRadius: PropTypes.number,
	openedImageBorderRadius: PropTypes.string,
	openedImageHeight: PropTypes.string,
	openedImageWidth: PropTypes.string,
	overlayBlurColor: PropTypes.string,
	padFactor: PropTypes.number,
	segments: PropTypes.number
};
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { gsap } from "gsap";
import "./PillNav.css";

const PillNav = ({
	logo,
	logoAlt = "Logo",
	items,
	activeHref,
	className = "",
	ease = "power3.easeOut",
	baseColor = "#fff",
	pillColor = "#060010",
	hoveredPillTextColor = "#060010",
	pillTextColor,
	onMobileMenuClick,
	initialLoadAnimation = true
}) => {
	const resolvedPillTextColor = pillTextColor ?? baseColor;
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const circleRefs = useRef([]);
	const tlRefs = useRef([]);
	const activeTweenRefs = useRef([]);
	const logoImgRef = useRef(null);
	const logoTweenRef = useRef(null);
	const hamburgerRef = useRef(null);
	const mobileMenuRef = useRef(null);
	const navItemsRef = useRef(null);
	const logoRef = useRef(null);

	useEffect(() => {
		const layout = () => {
			circleRefs.current.forEach(circle => {
				if (!circle?.parentElement) return;

				const pill = circle.parentElement;
				const rect = pill.getBoundingClientRect();
				const { width: w, height: h } = rect;
				const R = ((w * w) / 4 + h * h) / (2 * h);
				const D = Math.ceil(2 * R) + 2;
				const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
				const originY = D - delta;

				circle.style.width = `${D}px`;
				circle.style.height = `${D}px`;
				circle.style.bottom = `-${delta}px`;

				gsap.set(circle, {
					scale: 0,
					transformOrigin: `50% ${originY}px`,
					xPercent: -50
				});

				const label = pill.querySelector(".pill-label");
				const white = pill.querySelector(".pill-label-hover");

				if (label) gsap.set(label, { y: 0 });
				if (white) gsap.set(white, { opacity: 0, y: h + 12 });

				const index = circleRefs.current.indexOf(circle);
				if (index === -1) return;

				tlRefs.current[index]?.kill();
				const tl = gsap.timeline({ paused: true });

				tl.to(circle, { duration: 2, ease, overwrite: "auto", scale: 1.2, xPercent: -50 }, 0);

				if (label) {
					tl.to(label, { duration: 2, ease, overwrite: "auto", y: -(h + 8) }, 0);
				}

				if (white) {
					gsap.set(white, { opacity: 0, y: Math.ceil(h + 100) });
					tl.to(white, { duration: 2, ease, opacity: 1, overwrite: "auto", y: 0 }, 0);
				}

				tlRefs.current[index] = tl;
			});
		};

		layout();

		const onResize = () => layout();
		window.addEventListener("resize", onResize);

		if (document.fonts?.ready) {
			document.fonts.ready.then(layout).catch(() => { /*  */ });
		}

		const menu = mobileMenuRef.current;
		if (menu) {
			gsap.set(menu, { opacity: 0, scaleY: 1, visibility: "hidden" });
		}

		if (initialLoadAnimation) {
			const logo = logoRef.current;
			const navItems = navItemsRef.current;

			if (logo) {
				gsap.set(logo, { scale: 0 });
				gsap.to(logo, {
					duration: 0.6,
					ease,
					scale: 1
				});
			}

			if (navItems) {
				gsap.set(navItems, { overflow: "hidden", width: 0 });
				gsap.to(navItems, {
					duration: 0.6,
					ease,
					width: "auto"
				});
			}
		}

		return () => window.removeEventListener("resize", onResize);
	}, [items, ease, initialLoadAnimation]);

	const handleEnter = i => {
		const tl = tlRefs.current[i];
		if (!tl) return;
		activeTweenRefs.current[i]?.kill();
		activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
			duration: 0.3,
			ease,
			overwrite: "auto"
		});
	};

	const handleLeave = i => {
		const tl = tlRefs.current[i];
		if (!tl) return;
		activeTweenRefs.current[i]?.kill();
		activeTweenRefs.current[i] = tl.tweenTo(0, {
			duration: 0.2,
			ease,
			overwrite: "auto"
		});
	};

	const handleLogoEnter = () => {
		const img = logoImgRef.current;
		if (!img) return;
		logoTweenRef.current?.kill();
		gsap.set(img, { rotate: 0 });
		logoTweenRef.current = gsap.to(img, {
			duration: 0.2,
			ease,
			overwrite: "auto",
			rotate: 360
		});
	};

	const toggleMobileMenu = () => {
		const newState = !isMobileMenuOpen;
		setIsMobileMenuOpen(newState);

		const hamburger = hamburgerRef.current;
		const menu = mobileMenuRef.current;

		if (hamburger) {
			const lines = hamburger.querySelectorAll(".hamburger-line");
			if (newState) {
				gsap.to(lines[0], { duration: 0.3, ease, rotation: 45, y: 3 });
				gsap.to(lines[1], { duration: 0.3, ease, rotation: -45, y: -3 });
			} else {
				gsap.to(lines[0], { duration: 0.3, ease, rotation: 0, y: 0 });
				gsap.to(lines[1], { duration: 0.3, ease, rotation: 0, y: 0 });
			}
		}

		if (menu) {
			if (newState) {
				gsap.set(menu, { visibility: "visible" });
				gsap.fromTo(
					menu,
					{ opacity: 0, scaleY: 1, y: 10 },
					{
						duration: 0.3,
						ease,
						opacity: 1,
						scaleY: 1,
						transformOrigin: "top center",
						y: 0
					}
				);
			} else {
				gsap.to(menu, {
					duration: 0.2,
					ease,
					onComplete: () => {
						gsap.set(menu, { visibility: "hidden" });
					},
					opacity: 0,
					scaleY: 1,
					transformOrigin: "top center",
					y: 10
				});
			}
		}

		onMobileMenuClick?.();
	};

	const isExternalLink = href =>
		href.startsWith("http://")
    || href.startsWith("https://")
    || href.startsWith("//")
    || href.startsWith("mailto:")
    || href.startsWith("tel:")
    || href.startsWith("#");

	const isRouterLink = href => href && !isExternalLink(href);

	const cssVars = {
		"--base": baseColor,
		"--hover-text": hoveredPillTextColor,
		"--pill-bg": pillColor,
		"--pill-text": resolvedPillTextColor
	};

	return (
		<div className="pill-nav-container">
			<nav className={`pill-nav ${className}`} aria-label="Primary" style={cssVars}>
				{isRouterLink(items?.[0]?.href) ? (
					<Link
						className="pill-logo"
						to={items[0].href}
						aria-label="Home"
						onMouseEnter={handleLogoEnter}
						role="menuitem"
						ref={el => {
							logoRef.current = el;
						}}
					>
						<img src={logo} alt={logoAlt} ref={logoImgRef} />
					</Link>
				) : (
					<a
						className="pill-logo"
						href={items?.[0]?.href || "#"}
						aria-label="Home"
						onMouseEnter={handleLogoEnter}
						ref={el => {
							logoRef.current = el;
						}}
					>
						<img src={logo} alt={logoAlt} ref={logoImgRef} />
					</a>
				)}

				<div className="pill-nav-items desktop-only" ref={navItemsRef}>
					<div className="pill-list" role="menubar">
						{items.map((item, i) => (
							<div key={item.href || `item-${i}`} role="none">
								{isRouterLink(item.href) ? (
									<Link
										role="menuitem"
										to={item.href}
										className={`pill${activeHref === item.href ? " is-active" : ""}`}
										aria-label={item.ariaLabel || item.label}
										onMouseEnter={() => handleEnter(i)}
										onMouseLeave={() => handleLeave(i)}
									>
										<span
											className="hover-circle"
											aria-hidden="true"
											ref={el => {
												circleRefs.current[i] = el;
											}}
										/>
										<span className="label-stack">
											<span className="pill-label">{item.label}</span>
											<span className="pill-label-hover" aria-hidden="true">
												{item.label}
											</span>
										</span>
									</Link>
								) : (
									<a
										role="menuitem"
										href={item.href}
										className={`pill${activeHref === item.href ? " is-active" : ""}`}
										aria-label={item.ariaLabel || item.label}
										onMouseEnter={() => handleEnter(i)}
										onMouseLeave={() => handleLeave(i)}
									>
										<span
											className="hover-circle"
											aria-hidden="true"
											ref={el => {
												circleRefs.current[i] = el;
											}}
										/>
										<span className="label-stack">
											<span className="pill-label">{item.label}</span>
											<span className="pill-label-hover" aria-hidden="true">
												{item.label}
											</span>
										</span>
									</a>
								)}
							</div>
						))}
					</div>
				</div>

				<button
					className="mobile-menu-button mobile-only"
					onClick={toggleMobileMenu}
					aria-label="Toggle menu"
					ref={hamburgerRef}
				>
					<span className="hamburger-line" />
					<span className="hamburger-line" />
				</button>
			</nav>

			<div className="mobile-menu-popover mobile-only" ref={mobileMenuRef} style={cssVars}>
				<ul className="mobile-menu-list">
					{items.map((item, i) => (
						<li key={item.href || `mobile-item-${i}`}>
							{isRouterLink(item.href) ? (
								<Link
									to={item.href}
									className={`mobile-menu-link${activeHref === item.href ? " is-active" : ""}`}
									onClick={() => setIsMobileMenuOpen(false)}
								>
									{item.label}
								</Link>
							) : (
								<a
									href={item.href}
									className={`mobile-menu-link${activeHref === item.href ? " is-active" : ""}`}
									onClick={() => setIsMobileMenuOpen(false)}
								>
									{item.label}
								</a>
							)}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

PillNav.propTypes = {
	activeHref: PropTypes.string,
	baseColor: PropTypes.string,
	className: PropTypes.string,
	ease: PropTypes.string,
	hoveredPillTextColor: PropTypes.string,
	initialLoadAnimation: PropTypes.bool,
	items: PropTypes.arrayOf(
		PropTypes.shape({
			ariaLabel: PropTypes.string,
			href: PropTypes.string,
			label: PropTypes.string.isRequired
		})
	).isRequired,
	logo: PropTypes.string.isRequired,
	logoAlt: PropTypes.string,
	onMobileMenuClick: PropTypes.func,
	pillColor: PropTypes.string,
	pillTextColor: PropTypes.string
};

export default PillNav;
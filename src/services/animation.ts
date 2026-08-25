import gsap from 'gsap';

/**
 * Service providing reusable GSAP animation presets and effects.
 */
class AnimationService {
  /**
   * Animates the main landing menu with a staggered elastic entrance.
   */
  public animateMenuEntrance(container: HTMLElement | null) {
    if (!container) return;

    const children = container.querySelectorAll('.animate-gsap-item');
    if (!children.length) return;

    gsap.fromTo(
      children,
      {
        y: 40,
        opacity: 0,
        scale: 0.92
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.7,
        stagger: 0.08,
        ease: 'back.out(1.5)',
        clearProps: 'transform'
      }
    );
  }

  /**
   * Animates modal popups (SettingsModal, GameOverModal) with back.out elastic scaling.
   */
  public animateModalPopup(modalBox: HTMLElement | null) {
    if (!modalBox) return;

    gsap.fromTo(
      modalBox,
      {
        scale: 0.75,
        opacity: 0,
        y: 25
      },
      {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'back.out(1.7)',
        clearProps: 'transform'
      }
    );
  }

  /**
   * Smoothly animates a numeric counter up to target value (e.g. final score on Game Over).
   */
  public animateScoreCounter(
    element: HTMLElement | null,
    targetValue: number,
    duration: number = 1.2
  ) {
    if (!element) return;

    const counterObj = { value: 0 };
    gsap.to(counterObj, {
      value: targetValue,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        const rounded = Math.round(counterObj.value);
        element.textContent = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      }
    });
  }

  /**
   * Triggers a quick punch/scale pulse animation when combo or multiplier updates.
   */
  public animateComboPunch(element: HTMLElement | null) {
    if (!element) return;

    gsap.fromTo(
      element,
      { scale: 1.4, color: '#f59e0b' },
      { scale: 1, color: '', duration: 0.3, ease: 'power2.out', clearProps: 'scale' }
    );
  }

  /**
   * Triggers a subtle horizontal shake animation when warning timer or miss occurs.
   */
  public animateTimerShake(element: HTMLElement | null) {
    if (!element) return;

    gsap.fromTo(
      element,
      { x: -6 },
      {
        x: 6,
        duration: 0.06,
        repeat: 5,
        yoyo: true,
        ease: 'power1.inOut',
        onComplete: () => {
          gsap.set(element, { x: 0 });
        }
      }
    );
  }

  /**
   * Animates the Level Up celebration banner with a punchy bounce and fade out.
   */
  public animateLevelUpBanner(banner: HTMLElement | null) {
    if (!banner) return;

    gsap.fromTo(
      banner,
      { y: -60, opacity: 0, scale: 0.7 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: 'back.out(1.8)',
        onComplete: () => {
          gsap.to(banner, {
            y: -30,
            opacity: 0,
            scale: 0.9,
            duration: 0.5,
            delay: 1.4,
            ease: 'power2.in'
          });
        }
      }
    );
  }

  /**
   * Spawns a floating GSAP feedback text (e.g., "+300 PERFECT", "PERFECT!") at (x, y).
   */
  public spawnFloatingText(x: number, y: number, text: string, color: string = '#f59e0b') {
    const floatEl = document.createElement('div');
    floatEl.textContent = text;
    floatEl.className =
      'fixed pointer-events-none font-mono font-black text-sm sm:text-base z-50 tracking-wider drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]';
    floatEl.style.left = `${x}px`;
    floatEl.style.top = `${y}px`;
    floatEl.style.color = color;
    floatEl.style.transform = 'translate(-50%, -50%)';

    document.body.appendChild(floatEl);

    gsap.fromTo(
      floatEl,
      { y: 0, opacity: 1, scale: 0.8 },
      {
        y: -45,
        opacity: 0,
        scale: 1.3,
        duration: 0.75,
        ease: 'power2.out',
        onComplete: () => {
          if (floatEl.parentNode) {
            floatEl.parentNode.removeChild(floatEl);
          }
        }
      }
    );
  }
}

export const animationService = new AnimationService();

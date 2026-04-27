export function SplashPage({ setPage }) {
  function enterCardPage(event) {
    event?.stopPropagation?.();
    setPage("card");
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setPage("card");
    }
  }

  return (
    <section className="splash-page" role="button" tabIndex={0} onClick={enterCardPage} onKeyDown={handleKeyDown}>
      <div className="splash-page__ambient">
        <span className="splash-page__halo splash-page__halo--left" />
        <span className="splash-page__halo splash-page__halo--right" />
        <span className="splash-page__grid" />
        <span className="splash-page__particle splash-page__particle--a" />
        <span className="splash-page__particle splash-page__particle--b" />
        <span className="splash-page__particle splash-page__particle--c" />
      </div>

      <div className="splash-page__content">
        <p className="splash-page__eyebrow">Flux Landing Sequence</p>
        <div className="splash-page__logo">
          <span>外城小站</span>
          <strong>FLUX</strong>
        </div>
        <p className="splash-page__copy">在城市边缘启动一座长期写作与工程沉淀的小站。</p>
      </div>

      <button type="button" className="splash-page__enter" onClick={enterCardPage}>
        点击进入 / Tap to enter
      </button>
    </section>
  );
}

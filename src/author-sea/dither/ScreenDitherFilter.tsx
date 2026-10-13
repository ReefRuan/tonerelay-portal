// Extracted from the 006 journal study for this standalone experiment.
// A fixed viewport wrapper owns the filter, so its threshold tile never inherits camera movement.
const thresholdStep = (ink: string, paper: string) =>
  `${`${ink} `.repeat(255)}${paper}`;

export function ScreenDitherFilter() {
  return (
    <svg className="filter-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <filter
          id="ui-screen-dither"
          x="0"
          y="0"
          width="100%"
          height="100%"
          filterUnits="objectBoundingBox"
          primitiveUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feColorMatrix in="SourceGraphic" type="saturate" values="0" result="gray" />
          <feImage href={`${import.meta.env.BASE_URL}author-sea/bayer-threshold-4.svg`} x="0" y="0" width="8" height="8" result="tile" />
          <feTile in="tile" result="threshold" />
          <feComposite
            in="gray"
            in2="threshold"
            operator="arithmetic"
            k2="1"
            k3="-1"
            k4="1"
            result="screened"
          />
          <feComponentTransfer in="screened" result="dithered-opaque">
            <feFuncR type="discrete" tableValues={thresholdStep("0.10", "0.99")} />
            <feFuncG type="discrete" tableValues={thresholdStep("0.15", "0.99")} />
            <feFuncB type="discrete" tableValues={thresholdStep("0.18", "0.98")} />
            <feFuncA type="linear" slope="0" intercept="1" />
          </feComponentTransfer>
          <feComposite in="dithered-opaque" in2="SourceAlpha" operator="in" result="dithered" />
          {/* The dark DOM glyphs return on top of the screened UI; pale panels stay dithered. */}
          <feComponentTransfer in="gray" result="ink-luminance">
            <feFuncR type="table" tableValues="1 1 1 1 0.5 0 0 0 0" />
          </feComponentTransfer>
          <feColorMatrix
            in="ink-luminance"
            type="matrix"
            values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1 0 0 0 0"
            result="ink-mask"
          />
          <feComposite in="ink-mask" in2="SourceAlpha" operator="in" result="ink-mask-clipped" />
          <feMorphology in="ink-mask-clipped" operator="dilate" radius="3" result="ink-protection" />
          <feComposite in="SourceGraphic" in2="ink-protection" operator="in" result="clear-ink" />
          <feMerge>
            <feMergeNode in="dithered" />
            <feMergeNode in="clear-ink" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

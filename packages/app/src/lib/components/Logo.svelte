<script lang="ts">
  import { theme } from '@jill64/svelte-suite'

  let stroke = $derived(theme.isDark ? '#ffffff' : '#000000')
</script>

<svg width="32px" viewBox="-0.5 -0.5 137 120">
  <defs>
    <filter id="dropShadow">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1.7" result="blur" />
      <feOffset in="blur" dx="3" dy="3" result="offsetBlur" />
      <feFlood flood-color="#3D4574" flood-opacity="0.4" result="offsetColor" />
      <feComposite
        in="offsetColor"
        in2="offsetBlur"
        operator="in"
        result="offsetBlur"
      />
      <feBlend in="SourceGraphic" in2="offsetBlur" />
    </filter>
  </defs>
  <g filter="url(#dropShadow)">
    <g data-cell-id="0">
      <g data-cell-id="1">
        <g data-cell-id="0J_Jd1XUV7n1ClQ3BPki-7">
          <g>
            <path
              d="M 64 105 C 50.19 105 39 82.61 39 55 C 39 27.39 50.19 5 64 5"
              fill="none"
              {stroke}
              stroke-width="3"
              stroke-miterlimit="10"
              transform="rotate(60,64,55)"
              pointer-events="all"
            />
          </g>
        </g>
        <g data-cell-id="0J_Jd1XUV7n1ClQ3BPki-4">
          <g>
            <ellipse
              cx="107"
              cy="29"
              rx="10"
              ry="10"
              fill="#ffffff"
              {stroke}
              stroke-width="3"
              pointer-events="all"
            />
          </g>
        </g>
        <g data-cell-id="0J_Jd1XUV7n1ClQ3BPki-6">
          <g style="filter: drop-shadow(rgba(0, 0, 0, 0.25) 2px 3px 2px);">
            <path
              d="M 14 55 L 54 45 L 64 5 L 74 45 L 114 55 L 74 65 L 64 105 L 54 65 Z"
              fill="#ffffff"
              {stroke}
              stroke-width="3"
              stroke-miterlimit="10"
              pointer-events="all"
            />
          </g>
        </g>
        <g data-cell-id="0J_Jd1XUV7n1ClQ3BPki-8">
          <g style="filter: drop-shadow(rgba(0, 0, 0, 0.25) 2px 3px 2px);">
            <path
              d="M 64 105 C 50.19 105 39 82.61 39 55 C 39 27.39 50.19 5 64 5"
              fill="none"
              {stroke}
              stroke-width="3"
              stroke-miterlimit="10"
              transform="rotate(-120,64,55)"
              pointer-events="all"
            />
          </g>
        </g>
      </g>
    </g>
  </g>
</svg>

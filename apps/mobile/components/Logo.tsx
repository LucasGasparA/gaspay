import { Fragment } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';

interface LogoProps {
  size?: number;
}

/** Marca Dindim: duas moedas com anel interno, cifrão e serrilha lateral. */
export function Logo({ size = 76 }: LogoProps) {
  function coin(cx: number, cy: number, r: number, w: number, key: string) {
    const ox = r * 0.12;
    const oy = r * 0.12;
    const ticks = Array.from({ length: 9 }, (_, i) => {
      const t = (i + 0.5) / 9;
      const ang = (-50 + t * 100) * (Math.PI / 180);
      const x1 = cx + ox + r * Math.cos(ang);
      const y1 = cy + oy + r * Math.sin(ang);
      const x2 = cx + ox + r * 0.82 * Math.cos(ang);
      const y2 = cy + oy + r * 0.82 * Math.sin(ang);
      return (
        <Line
          key={`${key}-tick-${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#3D2E10"
          strokeWidth={w * 0.55}
          strokeLinecap="round"
        />
      );
    });
    return (
      <Fragment key={key}>
        <Circle cx={cx + ox} cy={cy + oy} r={r} fill="#C79424" stroke="#3D2E10" strokeWidth={w} />
        {ticks}
        <Circle cx={cx} cy={cy} r={r} fill="#EFC24A" stroke="#3D2E10" strokeWidth={w} />
        <Circle cx={cx} cy={cy} r={r * 0.72} fill="none" stroke="#3D2E10" strokeWidth={w * 0.4} />
        <SvgText x={cx} y={cy + r * 0.32} fontSize={r * 1.1} fontWeight="700" textAnchor="middle" fill="#C9971F">
          $
        </SvgText>
      </Fragment>
    );
  }

  return (
    <View style={{ width: size, height: size }}>
      <Svg viewBox="0 0 100 100" width={size} height={size}>
        {coin(38, 58, 26, 3, 'back')}
        {coin(64, 38, 26, 3, 'front')}
      </Svg>
    </View>
  );
}

import React from 'react';

export type SkeletonVariant = 'text' | 'circle' | 'rect' | 'card';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  count?: number;
}

const variantStyles: Record<SkeletonVariant, string> = {
  text: 'h-4 w-full rounded-md',
  circle: 'rounded-full aspect-square',
  rect: 'w-full rounded-xl',
  card: 'w-full h-44 rounded-2xl',
};

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  count = 1,
  className = '',
  style,
  ...props
}) => {
  const customStyle: React.CSSProperties = {
    ...style,
    ...(width !== undefined ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height !== undefined ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
  };

  const renderSingle = (key: number) => (
    <div
      key={key}
      aria-hidden="true"
      style={customStyle}
      className={`
        animate-pulse bg-burgundy-900/10
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    />
  );

  if (count > 1) {
    return (
      <div className="space-y-2.5 w-full">
        {Array.from({ length: count }, (_, idx) => renderSingle(idx))}
      </div>
    );
  }

  return renderSingle(0);
};

Skeleton.displayName = 'Skeleton';

export default Skeleton;

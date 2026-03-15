import React from 'react';

// Minimal mock for next/image that renders a plain <img> element
const Image = ({
  src,
  alt,
  fill,
  width,
  height,
  className,
  onError,
  ...rest
}: {
  src: string;
  alt?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  onError?: React.ReactEventHandler<HTMLImageElement>;
  [key: string]: unknown;
}) => (
  <img
    src={src}
    alt={alt}
    width={fill ? undefined : width}
    height={fill ? undefined : height}
    className={className}
    onError={onError}
    {...rest}
  />
);

export default Image;

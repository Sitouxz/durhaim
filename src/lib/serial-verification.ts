export type SerialVerification = {
  serial: string;
  status: string;
  verificationCount: number | null;
  createdAt: string | null;
  productName: string | null;
  productImage: string | null;
};

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

/**
 * Shape of the `record_serial_verification` RPC payload. The RPC is the only
 * serial lookup available to the public anon key, so both public verification
 * surfaces read their data from here rather than from the serial_numbers table.
 * Returns null when the serial is not registered.
 */
export function parseSerialVerification(payload: unknown): SerialVerification | null {
  if (!payload || typeof payload !== 'object') return null;

  const record = payload as Record<string, unknown>;
  if (record.found !== true) return null;

  const serial = asString(record.serial);
  const status = asString(record.status);
  if (!serial || !status) return null;

  return {
    serial,
    status,
    verificationCount: typeof record.verification_count === 'number' ? record.verification_count : null,
    createdAt: asString(record.created_at),
    productName: asString(record.product_name),
    productImage: asString(record.product_image),
  };
}

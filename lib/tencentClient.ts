import 'server-only';
import crypto from 'crypto';

export type Tc3RequestOptions = {
	service: string;
	version: string;
	action: string;
	region?: string;
	endpoint?: string;
	payload?: Record<string, any>;
	secretId?: string;
	secretKey?: string;
};

type Tc3AuthHeaders = {
	Authorization: string;
	'X-TC-Action': string;
	'X-TC-Version': string;
	'X-TC-Timestamp': string;
	'X-TC-Region'?: string;
	Host: string;
	'Content-Type': string;
};

function sha256Hex(message: string | Buffer): string {
	const data: crypto.BinaryLike = typeof message === 'string' ? message : new Uint8Array(message);
	return crypto.createHash('sha256').update(data).digest('hex');
}

function toBinaryLike(input: any): string | Uint8Array {
	if (typeof input === 'string') return input;
	if (input instanceof Uint8Array) return input;
	// Buffer case -> convert to Uint8Array view
	return new Uint8Array(input);
}

function hmacSHA256(key: string | Buffer | Uint8Array | crypto.KeyObject, msg: string): Buffer {
	const k = key instanceof crypto.KeyObject ? key : (toBinaryLike(key as any) as unknown as crypto.BinaryLike);
	return crypto.createHmac('sha256', k).update(msg).digest();
}

function hmacSHA256Hex(key: string | Buffer | Uint8Array | crypto.KeyObject, msg: string): string {
	const k = key instanceof crypto.KeyObject ? key : (toBinaryLike(key as any) as unknown as crypto.BinaryLike);
	return crypto.createHmac('sha256', k).update(msg).digest('hex');
}

function getTc3Headers(opts: Tc3RequestOptions, timestamp: number, body: string): Tc3AuthHeaders {
	const service = opts.service;
	const host = (opts.endpoint ? new URL(opts.endpoint).host : `${service}.tencentcloudapi.com`);
	const algorithm = 'TC3-HMAC-SHA256';
	const date = new Date(timestamp * 1000).toISOString().slice(0, 10);
	const httpRequestMethod = 'POST';
	const canonicalUri = '/';
	const canonicalQueryString = '';
	const canonicalHeaders = `content-type:application/json; charset=utf-8\nhost:${host}\n`;
	const signedHeaders = 'content-type;host';
	const hashedRequestPayload = sha256Hex(body);
	const canonicalRequest = [
		httpRequestMethod,
		canonicalUri,
		canonicalQueryString,
		canonicalHeaders,
		signedHeaders,
		hashedRequestPayload,
	].join('\n');

	const credentialScope = `${date}/${service}/tc3_request`;
	const hashedCanonicalRequest = sha256Hex(canonicalRequest);
	const stringToSign = [
		algorithm,
		String(timestamp),
		credentialScope,
		hashedCanonicalRequest,
	].join('\n');

	const secretId = opts.secretId || process.env.TENCENT_SECRET_ID || '';
	const secretKey = opts.secretKey || process.env.TENCENT_SECRET_KEY || '';
	if (!secretId || !secretKey) {
		throw new Error('Tencent Cloud credentials are missing. Set TENCENT_SECRET_ID and TENCENT_SECRET_KEY.');
	}

	const kDate = hmacSHA256(`TC3${secretKey}`, date);
	const kService = hmacSHA256(kDate, service);
	const kSigning = hmacSHA256(kService, 'tc3_request');
	const signature = hmacSHA256Hex(kSigning, stringToSign);

	const authorization = `${algorithm} Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

	const headers: Tc3AuthHeaders = {
		Authorization: authorization,
		'X-TC-Action': opts.action,
		'X-TC-Version': opts.version,
		'X-TC-Timestamp': String(timestamp),
		Host: host,
		'Content-Type': 'application/json; charset=utf-8',
	};

	if (opts.region) {
		headers['X-TC-Region'] = opts.region;
	}

	return headers;
}

export async function tc3Request<T = any>(opts: Tc3RequestOptions): Promise<T> {
	const url = opts.endpoint || `https://${opts.service}.tencentcloudapi.com`;
	const payloadString = JSON.stringify(opts.payload || {});
	const timestamp = Math.floor(Date.now() / 1000);
	const headers = getTc3Headers(opts, timestamp, payloadString);

	const response = await fetch(url, {
		method: 'POST',
		headers: headers as any,
		body: payloadString,
	});

	if (!response.ok) {
		const text = await response.text().catch(() => '');
		throw new Error(`Tencent API request failed: ${response.status} ${response.statusText} - ${text}`);
	}

	return (await response.json()) as T;
}

export function getTencentEnv() {
	return {
		secretId: process.env.TENCENT_SECRET_ID,
		secretKey: process.env.TENCENT_SECRET_KEY,
		region: process.env.TENCENT_REGION,
	};
}

// Convenience wrapper for Tencent MDP (MediaPackage) API
const MDP_SERVICE = 'mdp';
const MDP_VERSION = '2020-05-27';

export async function mdpRequest<T = any>(action: string, payload: Record<string, any> = {}, region?: string): Promise<T> {
	const env = getTencentEnv();
	return tc3Request<T>({
		service: MDP_SERVICE,
		version: MDP_VERSION,
		action,
		region: region || env.region,
		payload,
		secretId: env.secretId,
		secretKey: env.secretKey,
	});
}



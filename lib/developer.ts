/** Developer workbench reference data (PRD 5.5 — DCB & Digital Payment API). */

export type Lang = "node" | "python" | "php";

export const langLabels: Record<Lang, string> = {
  node: "Node.js",
  python: "Python",
  php: "PHP",
};

export type ApiParam = {
  name: string;
  required?: boolean;
  type: string;
  desc: string;
};

export type EndpointGroup = "DCB" | "Digital Payment" | "Webhook";

export type ApiEndpoint = {
  key: string;
  group: EndpointGroup;
  /** Short label in the endpoint picker. */
  label: string;
  /** Full heading shown in the detail pane. */
  title: string;
  method: "POST" | "GET";
  path: string;
  summary: string;
  params: ApiParam[];
  code: Record<Lang, string>;
  responseStatus: number;
  response: string;
};

export const endpointGroups: EndpointGroup[] = ["DCB", "Digital Payment", "Webhook"];

export const apiEndpoints: ApiEndpoint[] = [
  {
    key: "dcb-checkout",
    group: "DCB",
    label: "Checkout",
    title: "DCB Checkout",
    method: "POST",
    path: "/v1/dcb/checkout",
    summary:
      "Create a DCB checkout session. Returns an OTP challenge for billing to the operator's airtime balance.",
    params: [
      { name: "amount", required: true, type: "integer", desc: "Amount in rupiah (no decimals)." },
      { name: "msisdn", required: true, type: "string", desc: "Customer MSISDN (phone number)." },
      { name: "operator", required: true, type: "string", desc: "Operator ID (telkomsel, xl, indosat)." },
      { name: "idempotency_key", type: "string", desc: "Key to prevent double charges." },
    ],
    code: {
      node: `const airpay = require('@airpay/sdk')('sk_…');
const res = await airpay.dcb.create({
  amount: 25000,
  msisdn: '628123456789',
  operator: 'telkomsel',
});`,
      python: `import airpay
airpay.api_key = 'sk_…'

res = airpay.Dcb.create(
    amount=25000,
    msisdn='628123456789',
    operator='telkomsel',
)`,
      php: `<?php
\\Airpay\\Airpay::setApiKey('sk_…');

$res = \\Airpay\\Dcb::create([
  'amount'   => 25000,
  'msisdn'   => '628123456789',
  'operator' => 'telkomsel',
]);`,
    },
    responseStatus: 200,
    response: `{
  "id": "dcb_9f2a1",
  "status": "pending_otp",
  "amount": 25000,
  "operator": "telkomsel"
}`,
  },
  {
    key: "dcb-status",
    group: "DCB",
    label: "Status",
    title: "DCB Status",
    method: "GET",
    path: "/v1/dcb/{id}",
    summary: "Fetch the latest status of a DCB transaction, including the OTP confirmation result.",
    params: [
      { name: "id", required: true, type: "string", desc: "DCB transaction ID (path)." },
    ],
    code: {
      node: `const airpay = require('@airpay/sdk')('sk_…');
const res = await airpay.dcb.retrieve('dcb_9f2a1');`,
      python: `import airpay
airpay.api_key = 'sk_…'

res = airpay.Dcb.retrieve('dcb_9f2a1')`,
      php: `<?php
\\Airpay\\Airpay::setApiKey('sk_…');

$res = \\Airpay\\Dcb::retrieve('dcb_9f2a1');`,
    },
    responseStatus: 200,
    response: `{
  "id": "dcb_9f2a1",
  "status": "charged",
  "amount": 25000,
  "operator": "telkomsel"
}`,
  },
  {
    key: "charge-create",
    group: "Digital Payment",
    label: "Create Charge",
    title: "Create Charge",
    method: "POST",
    path: "/v1/charges",
    summary:
      "Create a charge for e-wallet, virtual account, card, or QRIS. Returns payment instructions.",
    params: [
      { name: "amount", required: true, type: "integer", desc: "Amount in rupiah (no decimals)." },
      { name: "currency", required: true, type: "string", desc: "Currency code, e.g. idr." },
      { name: "channel", required: true, type: "string", desc: "Payment channel: ewallet, va, card, qris." },
      { name: "customer", type: "string", desc: "Optional customer ID to keep history." },
    ],
    code: {
      node: `const airpay = require('@airpay/sdk')('sk_…');
const res = await airpay.charges.create({
  amount: 150000,
  currency: 'idr',
  channel: 'qris',
});`,
      python: `import airpay
airpay.api_key = 'sk_…'

res = airpay.Charge.create(
    amount=150000,
    currency='idr',
    channel='qris',
)`,
      php: `<?php
\\Airpay\\Airpay::setApiKey('sk_…');

$res = \\Airpay\\Charge::create([
  'amount'   => 150000,
  'currency' => 'idr',
  'channel'  => 'qris',
]);`,
    },
    responseStatus: 200,
    response: `{
  "id": "ch_7c1b8",
  "status": "pending",
  "channel": "qris",
  "amount": 150000
}`,
  },
  {
    key: "refund-create",
    group: "Digital Payment",
    label: "Refund",
    title: "Create Refund",
    method: "POST",
    path: "/v1/refunds",
    summary: "Refund part or all of a successful charge.",
    params: [
      { name: "charge", required: true, type: "string", desc: "ID of the charge to refund." },
      { name: "amount", type: "integer", desc: "Refund amount. Leave empty for a full refund." },
      { name: "reason", type: "string", desc: "Refund reason for auditing." },
    ],
    code: {
      node: `const airpay = require('@airpay/sdk')('sk_…');
const res = await airpay.refunds.create({
  charge: 'ch_7c1b8',
  amount: 50000,
});`,
      python: `import airpay
airpay.api_key = 'sk_…'

res = airpay.Refund.create(
    charge='ch_7c1b8',
    amount=50000,
)`,
      php: `<?php
\\Airpay\\Airpay::setApiKey('sk_…');

$res = \\Airpay\\Refund::create([
  'charge' => 'ch_7c1b8',
  'amount' => 50000,
]);`,
    },
    responseStatus: 200,
    response: `{
  "id": "re_2a9f0",
  "status": "succeeded",
  "charge": "ch_7c1b8",
  "amount": 50000
}`,
  },
  {
    key: "webhook-event",
    group: "Webhook",
    label: "Event",
    title: "Webhook Event",
    method: "POST",
    path: "https://your-app.com/webhook",
    summary:
      "AirPay sends events to your endpoint. Verify the AirPay-Signature header before processing.",
    params: [
      { name: "id", type: "string", desc: "Event ID, e.g. evt_… (for idempotency)." },
      { name: "type", type: "string", desc: "Event type, e.g. charge.succeeded." },
      { name: "data.object", type: "object", desc: "The resource object for the event." },
    ],
    code: {
      node: `const airpay = require('@airpay/sdk')('sk_…');
const event = airpay.webhooks.constructEvent(
  req.body,
  req.headers['airpay-signature'],
  'whsec_…',
);`,
      python: `import airpay

event = airpay.Webhook.construct_event(
    payload=request.data,
    sig_header=request.headers['AirPay-Signature'],
    secret='whsec_…',
)`,
      php: `<?php
$event = \\Airpay\\Webhook::constructEvent(
  $payload,
  $_SERVER['HTTP_AIRPAY_SIGNATURE'],
  'whsec_…'
);`,
    },
    responseStatus: 200,
    response: `{
  "id": "evt_5d3c2",
  "type": "charge.succeeded",
  "data": { "object": { "id": "ch_7c1b8" } }
}`,
  },
];

export type EventTone = "success" | "warning" | "danger";

export type ApiEventLog = {
  time: string;
  event: string;
  endpoint: string;
  status: number;
  tone: EventTone;
};

export const apiEventLogs: ApiEventLog[] = [
  { time: "14:22:01", event: "charge.succeeded", endpoint: "POST /v1/charges", status: 200, tone: "success" },
  { time: "14:19:44", event: "charge.pending", endpoint: "POST /v1/charges", status: 202, tone: "warning" },
  { time: "14:03:12", event: "refund.succeeded", endpoint: "POST /v1/refunds", status: 200, tone: "success" },
  { time: "13:58:07", event: "charge.failed", endpoint: "POST /v1/charges", status: 402, tone: "danger" },
];

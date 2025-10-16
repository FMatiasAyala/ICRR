const { WebSocketServer, WebSocket } = require('ws');
const net = require('net');

function createVncBridge({ allowPorts = [5900, 5901, 5902], allowSubnet = '192.' } = {}) {
  const allowed = new Set(allowPorts.map(Number));
  const wss = new WebSocketServer({ noServer: true, perMessageDeflate: false });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const host = url.searchParams.get('host') || '';
    const port = parseInt(url.searchParams.get('port') || '5900', 10);

    if (!host || Number.isNaN(port) || !allowed.has(port) || !host.startsWith(allowSubnet)) {
      try { ws.close(1008, 'Destino no permitido'); } catch {}
      return;
    }

    const tcp = net.connect({ host, port }, () => tcp.setNoDelay(true));
    tcp.on('data', chunk => { if (ws.readyState === WebSocket.OPEN) ws.send(chunk, { binary: true }); });
    ws.on('message', msg => { if (tcp.writable) tcp.write(msg); });

    tcp.on('error', err => { try { ws.close(1011, `TCP error: ${err.code}`); } catch {} });
    tcp.on('close', () => { try { ws.close(1000); } catch {} });
    ws.on('close',   () => { try { tcp.destroy(); } catch {} });
    ws.on('error',   () => { try { tcp.destroy(); } catch {} });
  });

  return wss;
}

module.exports = { createVncBridge };

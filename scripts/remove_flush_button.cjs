const fs = require('fs');
const file = 'apps/web-matrix/components/dashboard/ProtocolPoolsPanel.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `              {/* Legacy Balance Flush Action Widget */}
              <div className="mt-2.5 p-2 rounded-xl bg-[#f0f7ff] border border-[#d2e4ff] flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="text-[#657895] font-semibold">Contract Pool Balance:</span>
                  <span className="font-mono font-black text-[#102341]">11,578.45 TROB</span>
                </div>
                <button
                  type="button"
                  onClick={handleFlushDao}
                  disabled={flushingDao}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-[#2868e8] hover:bg-[#1d55c7] text-white text-[10.5px] font-bold shadow-2xs transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {flushingDao ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Pushing to Council...</span>
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                      <span>Flush 11,578 TROB to Members</span>
                    </>
                  )}
                </button>
              </div>`;

content = content.replace(/\r\n/g, '\n');
if (content.includes(target)) {
  content = content.replace(target, '');
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully removed Legacy Flush Action Widget from ProtocolPoolsPanel.tsx');
} else {
  console.log('Target not found in ProtocolPoolsPanel.tsx');
}

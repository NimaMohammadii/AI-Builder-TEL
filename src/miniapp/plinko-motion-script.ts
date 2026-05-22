export const PLINKO_MOTION_SCRIPT = `
(function(){
  window.VexaPlinkoMotion = Object.assign({
    earlyGuideCutoff: .45,
    earlyGuideStrength: .0014,
    earlyGuideMaxStep: .028,
    earlyGuideMaxVx: .72,
    startTargetBias: .24,
    startTargetBiasMax: 30,
    launchVelocityScale: .0075,
    launchVelocityMax: .34,
    launchRandomSpread: .075
  }, window.VexaPlinkoMotion || {});
})();
`;

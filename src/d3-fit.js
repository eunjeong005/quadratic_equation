import * as d3 from 'd3';

export function fitD3Canvas(svgSelection, padding = 20) {
  const svgNode = svgSelection.node();
  const g = svgSelection.select('g').node() || svgNode;
  let bbox;
  try { bbox = g.getBBox(); } catch (e) { return; }
  const width = svgNode.clientWidth;
  const height = svgNode.clientHeight;
  const scale = Math.min((width - padding) / bbox.width, (height - padding) / bbox.height);
  const tx = (width - bbox.width * scale) / 2 - bbox.x * scale;
  const ty = (height - bbox.height * scale) / 2 - bbox.y * scale;
  svgSelection.select('g')
    .transition().duration(300)
    .attr('transform', `translate(${tx},${ty}) scale(${scale})`);
}
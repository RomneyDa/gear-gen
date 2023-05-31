// class Gear extends React.Component {
//     render() {
//       // gear definition here
//       const pathString = path(9, 0.2, 13, 15, 0.3);
//       console.log(pathString)
//       return (
//         <div>
//           <svg viewBox="-1.1, -1.1, 2.2, 2.2">
//             <path d={pathString}>
//               <animateTransform
//                 attributeName="transform"
//                 attributeType="XML"
//                 type="rotate"
//                 from="0 0 0"
//                 to="360 0 0"
//                 dur="60s"
//                 repeatCount="indefinite"
//               />
//             </path>
//           </svg>
          
//         </div>
//       );
//     }
//   }
  
//   function sin(x) {
//     return trunc(Math.sin(2 * Math.PI * x / 360));
//   }
  
//   function cos(x) {
//     return trunc(Math.cos(2 * Math.PI * x / 360));
//   }
  
//   function trunc(x) {
//     return x.toFixed(3).substring(0, 5);
//   }
  
//   function path(toothCount, depth, toothAngle, rootAngle, holeRadius) {
//     const pitchAngle = 360 / toothCount;
//     const rampAngle = (pitchAngle - toothAngle - rootAngle) / 2;
//     const r = 1 - depth;
//     let text = "M0,-1";
//     let angle = 0;
//     for (let i = 0; i < toothCount; i++) {
//       angle += toothAngle / 2;
//       text += "A1,1,0,0,1," + sin(angle) + "," + -cos(angle);
//       angle += rampAngle;
//       text += "L" + trunc(r * sin(angle)) + "," + trunc(-r * cos(angle));
//       angle += rootAngle;
//       text +=
//         "A" +
//         trunc(r) +
//         "," +
//         trunc(r) +
//         ",0,0,1," +
//         trunc(r * sin(angle)) +
//         "," +
//         trunc(-r * cos(angle));
//       angle += rampAngle;
//       text += "L" + sin(angle) + "," + -cos(angle);
//       angle += toothAngle / 2;
//       text += "A1,1,0,0,1," + sin(angle) + "," + -cos(angle);
//     }
  
//     text +=
//       "L0," +
//       -holeRadius +
//       "A" +
//       holeRadius +
//       "," +
//       holeRadius +
//       ",0,1,0,0," +
//       holeRadius +
//       "A" +
//       holeRadius +
//       "," +
//       holeRadius +
//       ",0,1,0,0," +
//       -holeRadius +
//       "Z";
//     return text;
//   }
  
//   ReactDOM.render(<Gear />, document.getElementById("root"));
  
  
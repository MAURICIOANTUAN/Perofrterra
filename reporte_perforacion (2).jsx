import { useState, useCallback } from "react";
import * as XLSX from "xlsx";

const ACT = [
  'Charla Seguridad','Traslado Personal','Mantención','Documentación',
  'Traslado Cambio Postura','Instalación','Desinstalación',
  'Inst. y/o Retiro de Casino','Perforación sobre Carga','Perforación Roca',
  'Acondicionamiento Pozo','Movi. Herramienta','Colación','Reparación',
  'Medición de Trayectoria','Espera Medición Trayectoria','Espera Instrucciones',
  'Chequeo Topografía','Tronadura','Ventilación','Espera Agua',
  'Espera Combustible','Espera Energía Eléctrica','Espera Ventilación',
  'Rescate Herramienta','Espera Equipo de Apoyo / Visita Técnica'
];
const mkActs  = (v=[]) => ACT.map((label,i)=>({label,bb:v[i]?.[0]||'',cliente:v[i]?.[1]||''}));
const mkBarras= (a=[]) => a.map(x=>({nBarra:x[0]||'',desde:x[1]||'',hasta:x[2]||'',perforado:x[3]||'',recuperado:x[4]||'',retornoAgua:x[5]||''}));
const mkEquip = (a=[]) => a.map(x=>({patente:x[0]||'',horomInicial:x[1]||'',horomFinal:x[2]||'',total:x[3]||'',litros:x[4]||''}));
const mkAdit  = (a=[]) => a.map(x=>({nombre:x[0]||'',cantidad:x[1]||''}));
const mkMat   = (a=[]) => a.map(x=>({nombre:x[0]||'',cantidad:x[1]||''}));
const mkTurno = t => ({
  turno:t.turno||'A', cliente:t.cliente||'', asesorPrevencion:t.asesorPrevencion||'',
  jefeOperaciones:t.jefeOperaciones||'', jefeturno:t.jefeturno||'', nombrePozo:t.nombrePozo||'',
  operador:t.operador||'', inclinacion:t.inclinacion||'', ayudante1:t.ayudante1||'',
  azimut:t.azimut||'', ayudante2:t.ayudante2||'', sector:t.sector||'', volante:t.volante||'',
  fondoPrograma:t.fondoPrograma||'', dia:t.dia||'', mes:t.mes||'', anio:t.anio||'',
  sonda:t.sonda||'', diametroPozo:t.diametroPozo||'',
  mina:t.mina||false, superficie:t.superficie||false, subterranea:t.subterranea||false,
  coronaNum:t.coronaNum||'', coronaDesde:t.coronaDesde||'', coronaHasta:t.coronaHasta||'', coronaTotal:t.coronaTotal||'',
  escariadorNum:t.escariadorNum||'', escariadorDesde:t.escariadorDesde||'', escariadorHasta:t.escariadorHasta||'', escariadorTotal:t.escariadorTotal||'',
  barrilNum:t.barrilNum||'', barrilDesde:t.barrilDesde||'', barrilHasta:t.barrilHasta||'', barrilTotal:t.barrilTotal||'',
  profInicioTurno:t.profInicioTurno||'', profFinTurno:t.profFinTurno||'', totalMetros:t.totalMetros||'',
  actividades:t.actividades||mkActs(), totalHorasBB:t.totalHorasBB||'', totalHorasCliente:t.totalHorasCliente||'',
  barras:t.barras||[], aditivos:t.aditivos||[], consumoAgua:t.consumoAgua||'', nombreCachimba:t.nombreCachimba||'',
  domiciliarios:t.domiciliarios||'', industriales:t.industriales||'', reciclables:t.reciclables||'', peligrosos:t.peligrosos||'',
  equipos:t.equipos||[],
  otrosBarras:t.otrosBarras||'', otrosBarril:t.otrosBarril||'', otrosMuerto:t.otrosMuerto||'',
  otrosTotalHerramientas:t.otrosTotalHerramientas||'', otrosResta:t.otrosResta||'', otrosFondoPozo:t.otrosFondoPozo||'',
  materiales:t.materiales||[], observaciones:t.observaciones||'',
});

const INITIAL_DATA = {
  'U6-2':{ turnos:[
    mkTurno({ turno:'A', cliente:'Pucobre', asesorPrevencion:'D. Columna', jefeOperaciones:'M. González',
      jefeturno:'E. Mann', nombrePozo:'DDH-5A-40', operador:'E. Lean', inclinacion:'32',
      ayudante1:'C. Pirrotta', azimut:'232', ayudante2:'F. Lustra', sector:'110585',
      fondoPrograma:'170', dia:'08', mes:'10', anio:'2025', sonda:'U6-2', diametroPozo:'110', superficie:true,
      coronaNum:'17733-01', coronaDesde:'125.45', coronaHasta:'126.00', coronaTotal:'156.00',
      escariadorNum:'', escariadorDesde:'125.45', escariadorHasta:'126.00', escariadorTotal:'132.35',
      barrilNum:'', barrilDesde:'125.45', barrilHasta:'126.00', barrilTotal:'632.85',
      profInicioTurno:'125.45', profFinTurno:'126.00', totalMetros:'0.55',
      actividades:mkActs([['1/2'],['1'],[],['1/2'],[],[],[],[],[],['1'],['3'],['2'],['1'],[],[],[],[],[],[],['1']]),
      totalHorasBB:'9', totalHorasCliente:'3',
      barras:mkBarras([['','125.45','126.00','0.55','0.55','0%']]),
      aditivos:mkAdit([['Bargrasse','01'],['Drill Lub','01']]),
      equipos:mkEquip([['Sonda UB-2','18032','18041','2',''],['Cam. 5AZTD','95929','95948','','19']]),
      otrosBarras:'2', otrosBarril:'2.15', otrosTotalHerramientas:'125.45', otrosResta:'2.15', otrosFondoPozo:'125.00',
      materiales:mkMat([['Litros','02'],['Tacos','0']]),
      observaciones:'Se termina turno con lluvia de nueva edad, en caros 125.00 a 126.00. Se traslada a supervisores del área. Se empuja herramientas con condiciones y se llena 0.55.',
    }),
    mkTurno({ turno:'B', cliente:'Pucobre', asesorPrevencion:'D. Caligón', jefeOperaciones:'M. González',
      jefeturno:'Manuel S. Dardán', nombrePozo:'DDH25-3A', operador:'Manuel Alardoze', inclinacion:'+32',
      ayudante1:'Cristián Valldares', azimut:'232', ayudante2:'Nicolás Narrata', sector:'3A',
      fondoPrograma:'170', dia:'08', mes:'10', anio:'2025', sonda:'U6-2', diametroPozo:'NQ', subterranea:true,
      coronaNum:'11733-04', coronaDesde:'126.00', coronaHasta:'126.00', coronaTotal:'153.40',
      escariadorNum:'141.777', escariadorDesde:'126.00', escariadorHasta:'126.00', escariadorTotal:'432.85',
      barrilNum:'', barrilDesde:'126.00', barrilHasta:'126.00', barrilTotal:'132.85',
      profInicioTurno:'126.00', profFinTurno:'126.00', totalMetros:'0.00',
      actividades:mkActs([['1/2'],['1/2'],['1/2'],['1/2'],['1/2'],[],['3 1/2'],['1 1/2'],[],[],[],['1'],['1'],['1'],['1'],['2'],[],[],['','1']]),
      totalHorasBB:'11', totalHorasCliente:'1', barras:mkBarras([]), aditivos:mkAdit([]),
      equipos:mkEquip([['Unidad de Potencia','12044','12044','3',''],['Can Sonda SS2T-40','95962','95968','','5']]),
      materiales:mkMat([['Barril','01'],['Roscante','02'],['Catalin','01'],['Condanes','01'],['Polo Trendel','01'],['C. Mujetora','01']]),
      observaciones:'No inicia turno con charla de seguridad. Se traslada personas al área de trabajo. Documentación y mantención diaria. Fondo no funciona y se espera de medición. Se crea cambio de azimut. Fondo queda en estandarización.',
    }),
  ]},
  'U8-5':{ turnos:[
    mkTurno({ turno:'A', cliente:'Pucobre', asesorPrevencion:'C. Velt E.', jefeOperaciones:'M. González',
      jefeturno:'Dietro (Corsa)', nombrePozo:'DNH75-6HP-62', operador:'Nelson Díaz / Miguel Torres', inclinacion:'-69°',
      ayudante1:'Ricardo Agonte', azimut:'90', sector:'Granate 710',
      fondoPrograma:'540', dia:'08', mes:'10', anio:'2025', sonda:'U8-5', diametroPozo:'HQ', mina:true,
      coronaNum:'212772', coronaDesde:'540.00', coronaHasta:'540.00', coronaTotal:'70.40',
      escariadorNum:'555693', escariadorDesde:'287.00', escariadorHasta:'540.00', escariadorTotal:'753.00',
      barrilNum:'1308125', barrilDesde:'', barrilHasta:'540.00', barrilTotal:'540.00',
      profInicioTurno:'540.00', profFinTurno:'540.00', totalMetros:'0.00',
      actividades:mkActs([['1/2'],['1'],[],['1/2'],[],[],[],[],['1'],[],['2 1/2'],[],[],['4'],[],[],[],[],['2']]),
      totalHorasBB:'17', barras:mkBarras([]),
      aditivos:mkAdit([['Drill Lub','01'],['Al-ipol','01']]),
      consumoAgua:'10000', nombreCachimba:'C. Jalouse',
      equipos:mkEquip([['Unidad de Potencia','78.06','78.04','0.3',''],['Gas Cat 1','27700','27707','07','265'],['Camioneta L0-U88','13755','13748','26','43'],['Max Light','13799','13299','00','58']]),
      materiales:mkMat([]),
      observaciones:'Se inicia turno con traslado del personal, charla de seguridad, llenado de documentos y mantención. Pozo se rellena 1.10 Mts. Se presenta fuga en unidad de rotación. Turno queda para instalaciones.',
    }),
    mkTurno({ turno:'B', cliente:'Pucobre', asesorPrevencion:'Camilo Vélez', jefeOperaciones:'Naired González',
      jefeturno:'Wes Narca', nombrePozo:'DDH26GUP-03', operador:'Carlos Coufasias', inclinacion:'-67',
      ayudante1:'Alejandro Leyton', azimut:'90', ayudante2:'José Aguila', sector:'710 Granate',
      fondoPrograma:'510', dia:'08', mes:'10', anio:'2025', sonda:'U8-5', diametroPozo:'HQ', superficie:true,
      coronaNum:'212772', coronaDesde:'540.00', coronaHasta:'540.00', coronaTotal:'80.40',
      escariadorNum:'555693', escariadorDesde:'540.00', escariadorHasta:'540.00', escariadorTotal:'253.00',
      barrilNum:'1308125', barrilDesde:'540.00', barrilHasta:'540.00', barrilTotal:'',
      profInicioTurno:'540.00', profFinTurno:'540.00', totalMetros:'0',
      actividades:mkActs([['1/2'],['1 1/2'],['1/2'],['1/2'],[],['4/6'],[],[],[],['1'],['1 1/2'],[],['1'],['6']]),
      totalHorasBB:'12', barras:mkBarras([['','540.00','','','','']]), aditivos:mkAdit([]),
      equipos:mkEquip([['Sonda','3809','3813','4',''],['Gas Cat 1','21200','21118','9',''],['Ham Light','13300','13309','9',''],['Camioneta LG-NG-88','134780','','','']]),
      materiales:mkMat([]),
      observaciones:'Traslado de personal a postura de trabajo. Charla de seguridad. Documentación y mantención diaria. Se instala sonda, se acoplan barras, se escorba con HQ hasta los 539.50 Mts. Sonda operativa.',
    }),
  ]},
  'U8-7':{ turnos:[
    mkTurno({ turno:'A', cliente:'MPC', asesorPrevencion:'D. Veliz', jefeOperaciones:'M. González',
      jefeturno:'A. Martín', nombrePozo:'MZS-lle18', operador:'B. Sánchez', inclinacion:'-15',
      ayudante1:'M. Loyola', azimut:'37', ayudante2:'B. Báez', sector:'MHC',
      fondoPrograma:'100.00', dia:'08', mes:'10', anio:'2025', sonda:'U8-7', diametroPozo:'NQ', superficie:true,
      coronaNum:'10055Z-04', coronaDesde:'20.10', coronaHasta:'55.15', coronaTotal:'221.50',
      escariadorNum:'68944', escariadorDesde:'20.10', escariadorHasta:'55.15', escariadorTotal:'453.85',
      barrilNum:'06-10-25', barrilDesde:'20.10', barrilHasta:'55.15', barrilTotal:'152.20',
      profInicioTurno:'20.10', profFinTurno:'55.15', totalMetros:'35.05',
      actividades:mkActs([['1/2'],['1'],['1/2'],['1/2'],[],[],[],[],[],['6'],['1 1/2'],[],['1'],['1']]),
      totalHorasBB:'12',
      barras:mkBarras([['','20.10','23.15','3.05','3.05','100%'],['','23.15','26.15','3.00','3.00','11'],
        ['','26.15','29.15','3.00','3.00','11'],['','29.15','32.15','3.00','3.00','4'],
        ['','32.15','35.15','3.00','3.00','4'],['','35.15','38.15','3.00','3.00','4'],
        ['','38.15','41.15','3.00','3.00','4'],['','41.15','44.15','3.00','3.00','4'],
        ['','44.15','47.15','3.00','3.00','4'],['','47.15','50.15','3.00','3.00','4'],
        ['','50.15','53.15','3.00','3.00','4'],['','53.15','55.15','2.00','2.00','4'],['','55.15','','','','']]),
      aditivos:mkAdit([['Condicionadores','']]),
      equipos:mkEquip([['Sonda','9092','9099','5',''],['GAS','13614','13619','5','190'],['Handtai','8708','8768','0','22'],['SS-21-28','98543','99600','35','']]),
      otrosBarras:'180/300=54.00', otrosBarril:'2.15', otrosTotalHerramientas:'56.15', otrosResta:'100', otrosFondoPozo:'55.15',
      materiales:mkMat([['Cajas','11'],['Tacos','56']]),
      observaciones:'Se inicia turno con charla de seguridad, llenado de documentos. Se acondiciona el pozo. Ventilación en 2 pc, semi compada. Se arroja Broca 0° 1000.',
    }),
    mkTurno({ turno:'B', cliente:'Pucobre', asesorPrevencion:'D. Ledezma', jefeOperaciones:'M. González',
      jefeturno:'Manuel Triborren', nombrePozo:'D10J25 Mhop', operador:'José Menoude Z.', inclinacion:'-15',
      ayudante1:'Sebastián Ledezpur', azimut:'32', ayudante2:'Eduardo Muñoz', sector:'Superficie MMC',
      fondoPrograma:'100.00', dia:'08', mes:'10', anio:'2025', sonda:'U8-7', diametroPozo:'10', superficie:true,
      coronaNum:'14049-01', coronaDesde:'55.15', coronaHasta:'67.80', coronaTotal:'12.65',
      escariadorNum:'168944', escariadorDesde:'55.15', escariadorHasta:'67.80', escariadorTotal:'466.50',
      barrilNum:'06-10-25', barrilDesde:'55.15', barrilHasta:'67.80', barrilTotal:'164.85',
      profInicioTurno:'55.15', profFinTurno:'67.80', totalMetros:'12.65',
      actividades:mkActs([['1/2'],['1 1/2'],['1/2'],['1/2'],[],[],[],[],[],['2 1/2'],['3'],['1 1/2'],['1']]),
      totalHorasBB:'11', totalHorasCliente:'1',
      barras:mkBarras([['','55.45','56.45','1.00','1.00','80%'],['','56.15','58.65','2.50','2.50','80%'],
        ['','58.65','59.80','1.15','1.15','80%'],['','59.80','61.75','1.95','1.95','80%'],
        ['','61.75','63.00','1.25','1.25','80%'],['','63.00','64.80','1.80','1.65','0%'],
        ['','64.80','67.80','3.00','3.00','80%'],['','67.80','','','','']]),
      aditivos:mkAdit([['Sin aditivos abiertos','']]),
      equipos:mkEquip([['Sonda','9096','9101','5',''],['GAS','13678','13623','5',''],['MAY-Hi','9208','9213','5',''],['SJ-LT-28','98608','98643','35','']]),
      otrosBarras:'23×3=69.00', otrosBarril:'2.15', otrosTotalHerramientas:'71.15', otrosResta:'3.35', otrosFondoPozo:'67.80',
      materiales:mkMat([['Cajas','04'],['Tacos','23']]),
      observaciones:'Se inicia turno con charla de seguridad, chequeo de vehículo. Se traslada personal a postura. Documentación y mantención diaria. Cambio de Corona. Se acoge el torno a los 63.00 mts. Sonda operativa.',
    }),
  ]},
  'U8-4':{ turnos:[
    mkTurno({ turno:'A', cliente:'Pucobre', asesorPrevencion:'Camilo Vélis', jefeOperaciones:'M. González',
      jefeturno:'Patricio Peresa', nombrePozo:'DDH25-6M10-01', operador:'Nele Tavola N.', inclinacion:'-63°',
      ayudante1:'Milton Patros', azimut:'122', ayudante2:'Jheason Díaz', sector:'Granate 710',
      fondoPrograma:'430 mts', dia:'08', mes:'10', anio:'2025', sonda:'U8-4', diametroPozo:'NQ', superficie:true,
      coronaNum:'C-56U4', coronaDesde:'12960', coronaHasta:'32485', coronaTotal:'16525',
      escariadorNum:'751696', escariadorDesde:'2305', escariadorHasta:'32485', escariadorTotal:'301.20',
      barrilNum:'13-08-25', barrilDesde:'', barrilHasta:'32485', barrilTotal:'379.10',
      profInicioTurno:'318.65', profFinTurno:'324.86', totalMetros:'6.20',
      actividades:mkActs([['1'],[],['1/2'],['1/2'],[],[],[],[],[],['6'],['1'],[],['1'],[],[],[],[],[],[],[],[],[],[],[],['1 1/2']]),
      totalHorasBB:'12',
      barras:mkBarras([['','31865','31965','1.20','0.59','0%'],['','31965','32065','1.10','0.80','11'],
        ['','32075','32185','1.10','1.10','11'],['','32185','32320','1.35','1.35','11'],['','32320','32486','1.65','1.65','6']]),
      aditivos:mkAdit([['Axipal-5','01 balde'],['Drill Lub','01 balde']]),
      consumoAgua:'20000', nombreCachimba:'F. Ñanbre',
      equipos:mkEquip([['Sonda U84','7259','7269','10',''],['CAT 2 BAC','11816','11836','10','276'],['Camioneta SJFE-67','104113','104250','32',''],['Maxi Light','7525','7526','0','']]),
      otrosBarras:'283/300=76500', otrosBarril:'2.70', otrosMuerto:'F. Madre 14000', otrosTotalHerramientas:'76.17', otrosResta:'2.825', otrosFondoPozo:'F-Hijo 224.86',
      materiales:mkMat([]),
      observaciones:'Traslado de personal. Charla de seguridad. Documentación diaria. Perforación fracturada blanda. Se trabaja en liberación de tubo interior atorado en barril con resultado positivo. Perforación en falla, sin pérdida de muestra.',
    }),
    mkTurno({ turno:'B', cliente:'Pucobre', asesorPrevencion:'C. Veut', jefeOperaciones:'M. González',
      jefeturno:'Ues Narea', nombrePozo:'DDH25-3686R-01-3', operador:'Roberto Migo Díaz', inclinacion:'-63',
      ayudante1:'Kevin Anes', azimut:'122', ayudante2:'Ceudin Paredes', sector:'710 Gronate',
      fondoPrograma:'430', dia:'08', mes:'10', anio:'2025', sonda:'U8-4', diametroPozo:'N.O.', mina:true,
      coronaNum:'C-8604', coronaDesde:'324.88', coronaHasta:'336.20', coronaTotal:'176.60',
      escariadorNum:'884696', escariadorDesde:'324.88', escariadorHasta:'336.20', escariadorTotal:'372.18',
      barrilNum:'13/08/25', barrilDesde:'324.88', barrilHasta:'336.20', barrilTotal:'391.08',
      profInicioTurno:'324.85', profFinTurno:'336.20', totalMetros:'11.35',
      actividades:mkActs([['1/2'],['1 1/2'],['1/2'],['1/2'],[],[],[],[],[],['6.0'],['2.0'],[],['1.0']]),
      totalHorasBB:'12',
      barras:mkBarras([['5','324.88','327.28','2.40','2.40','0%'],['','327.28','329.28','2.00','2.00','0%'],
        ['','329.28','330.70','1.48','1.48','0%'],['','330.70','333.70','3.00','8.00','0%'],['','333.70','336.20','2.50','2.80','0%']]),
      aditivos:mkAdit([['Soda','01'],['Drill Lub','01'],['Eco Tpool','01']]),
      equipos:mkEquip([['Sonda','70.69','70.77','8.0',''],['O.A.S.','118.76','118.85','9.0',''],['Camioneta SJFE-67','104236','104268','32','']]),
      otrosBarras:'258×300=779.00', otrosBarril:'2.70', otrosMuerto:'40DZE=440.00', otrosTotalHerramientas:'776.70', otrosResta:'0.40', otrosFondoPozo:'F.Hijo = 336.20',
      materiales:mkMat([]),
      observaciones:'Traslado personal / charla seguridad. Se lleva documentación y chequeo de equipo. Se acondiciona pozo y se inicia perforación en roca fracturada hasta final de turno. Pozo está sin retorno de lodo. Equipo operativo.',
    }),
  ]},
};

const SONDAS = ['U6-2','U8-5','U8-7','U8-4'];
const CLR = {
  orange:'#E8520A', orangeHover:'#D04808', orangeLight:'#FEF0E8', orangeBorder:'#F0824A',
  navy:'#1C2B3A', navyMid:'#2A3F55', navyLight:'#EBF1F7',
  teal:'#0B7A63', tealLight:'#E3F5F1',
  purple:'#5540D4', purpleLight:'#EEEAFD',
  blue:'#1458B8', blueLight:'#E4EEFB',
  amber:'#A86200', amberLight:'#FEF3E0',
  green:'#1E7A36', greenLight:'#E6F4EB',
  red:'#B83030', redLight:'#FDECEA',
  gray:'#556070', grayLight:'#F5F7FA',
  border:'#CBD5E0', borderStrong:'#94A3B8',
  white:'#FFFFFF', bg:'#ECF1F7',
};

const SECS = {
  personal:   [CLR.navy,   CLR.navyLight,   '👤'],
  aceros:     [CLR.orange, CLR.orangeLight,  '⚙️'],
  profund:    [CLR.teal,   CLR.tealLight,    '📏'],
  actividades:[CLR.purple, CLR.purpleLight,  '⏱️'],
  barras:     [CLR.blue,   CLR.blueLight,    '🔩'],
  aditivos:   [CLR.green,  CLR.greenLight,   '🧪'],
  equipos:    [CLR.amber,  CLR.amberLight,   '🚛'],
  otros:      [CLR.gray,   CLR.grayLight,    '📋'],
  obs:        [CLR.navy,   CLR.navyLight,    '📝'],
};

const Card = ({sk,title,children})=>{
  const [accent,light,icon]=SECS[sk]||SECS.otros;
  return(
    <div style={{background:CLR.white,borderRadius:14,marginBottom:18,overflow:'hidden',boxShadow:'0 3px 12px rgba(0,0,0,0.08)',border:`1px solid ${CLR.border}`}}>
      <div style={{background:accent,padding:'11px 20px',display:'flex',alignItems:'center',gap:10}}>
        <span style={{fontSize:16}}>{icon}</span>
        <span style={{color:CLR.white,fontWeight:800,fontSize:12,letterSpacing:'0.07em',textTransform:'uppercase'}}>{title}</span>
        <div style={{flex:1}}/>
        <div style={{width:32,height:2,background:'rgba(255,255,255,0.25)',borderRadius:1}}/>
      </div>
      <div style={{padding:'18px 20px 16px',background:light}}>
        {children}
      </div>
    </div>
  );
};

const inp = (extra={})=>({
  padding:'9px 12px',fontSize:14,borderRadius:8,border:`2px solid ${CLR.border}`,
  background:CLR.white,color:CLR.navy,fontFamily:'inherit',width:'100%',boxSizing:'border-box',
  outline:'none',transition:'border-color 0.15s',...extra
});

const Field=({label,value,onChange,span,sm})=>(
  <div style={{gridColumn:span?`span ${span}`:undefined,display:'flex',flexDirection:'column',gap:4}}>
    <label style={{fontSize:11,fontWeight:800,color:CLR.gray,textTransform:'uppercase',letterSpacing:'0.06em'}}>{label}</label>
    <input value={value} onChange={e=>onChange(e.target.value)} style={inp(sm?{padding:'7px 10px',fontSize:13}:{})}
      onFocus={e=>e.target.style.borderColor=CLR.orange} onBlur={e=>e.target.style.borderColor=CLR.border}/>
  </div>
);

const TdIn=({val,onChange,center,hi,wd})=>(
  <input value={val} onChange={e=>onChange(e.target.value)}
    style={{padding:'7px 8px',fontSize:13,border:`2px solid ${hi?CLR.orange:CLR.border}`,borderRadius:7,
      background:hi?CLR.orangeLight:CLR.white,color:hi?CLR.orange:CLR.navy,fontFamily:'inherit',
      width:wd||'100%',boxSizing:'border-box',outline:'none',fontWeight:hi?700:400,
      textAlign:center?'center':'left'}}
    onFocus={e=>e.target.style.borderColor=CLR.orange} onBlur={e=>e.target.style.borderColor=hi?CLR.orange:CLR.border}/>
);

const PlusBtn=({label,onClick})=>(
  <button onClick={onClick} style={{marginTop:10,padding:'7px 16px',fontSize:12,fontWeight:700,
    borderRadius:8,border:`2px dashed ${CLR.borderStrong}`,background:'transparent',
    color:CLR.gray,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:6}}>
    <span style={{fontSize:18,lineHeight:1}}>+</span>{label}
  </button>
);

const XBtn=({onClick})=>(
  <button onClick={onClick} style={{padding:'5px 9px',fontSize:11,fontWeight:800,border:'none',
    background:CLR.redLight,color:CLR.red,cursor:'pointer',borderRadius:6,lineHeight:1,whiteSpace:'nowrap'}}>✕</button>
);

const StatPill=({label,value,accent})=>(
  <div style={{background:CLR.white,border:`2px solid ${accent||CLR.orange}`,borderRadius:10,
    padding:'10px 14px',display:'flex',flexDirection:'column',gap:2}}>
    <span style={{fontSize:10,fontWeight:800,color:accent||CLR.orange,textTransform:'uppercase',letterSpacing:'0.06em'}}>{label}</span>
    <span style={{fontSize:20,fontWeight:900,color:CLR.navy,lineHeight:1.1}}>{value||'—'}</span>
  </div>
);

export default function App(){
  const [sel,setSel]=useState('U6-2');
  const [ti,setTi]=useState(0);
  const [data,setData]=useState(INITIAL_DATA);
  const [modal,setModal]=useState(false);
  const [eTo,setETo]=useState('');
  const [eSub,setESub]=useState('');
  const [sending,setSending]=useState(false);
  const [eStatus,setEStatus]=useState('');

  const cur=data[sel].turnos[ti];
  const upd=useCallback((f,v)=>setData(p=>({...p,[sel]:{...p[sel],turnos:p[sel].turnos.map((t,i)=>i===ti?{...t,[f]:v}:t)}})),[sel,ti]);
  const updArr=useCallback((f,idx,k,v)=>setData(p=>{const a=[...p[sel].turnos[ti][f]];a[idx]={...a[idx],[k]:v};return{...p,[sel]:{...p[sel],turnos:p[sel].turnos.map((t,i)=>i===ti?{...t,[f]:a}:t)}}}),[sel,ti]);
  const addRow=(f,e)=>setData(p=>{const a=[...p[sel].turnos[ti][f],e];return{...p,[sel]:{...p[sel],turnos:p[sel].turnos.map((t,i)=>i===ti?{...t,[f]:a}:t)}};});
  const delRow=(f,idx)=>setData(p=>{const a=p[sel].turnos[ti][f].filter((_,i)=>i!==idx);return{...p,[sel]:{...p[sel],turnos:p[sel].turnos.map((t,i)=>i===ti?{...t,[f]:a}:t)}};});

  const exportXLS=()=>{
    const wb=XLSX.utils.book_new();
    SONDAS.forEach(s=>{
      data[s].turnos.forEach(t=>{
        const rows=[
          ['REPORTE DIARIO DE PERFORACIÓN — PERFORTERRA ATACAMA'],['Código:','R-SGI-SS-05','Versión:','2'],
          [],['INFORMACIÓN GENERAL'],
          ['Cliente',t.cliente,'Asesor Prevención',t.asesorPrevencion],
          ['Jefe Turno',t.jefeturno,'Jefe Operaciones',t.jefeOperaciones],
          ['Operador',t.operador,'Pozo',t.nombrePozo],
          ['Ayudante 1',t.ayudante1,'Inclinación',t.inclinacion],
          ['Ayudante 2',t.ayudante2,'Azimut',t.azimut],
          ['Sector',t.sector,'Sonda',t.sonda],
          ['Turno',t.turno,'Fecha',`${t.dia}/${t.mes}/${t.anio}`],
          ['Diámetro',t.diametroPozo,'Ubicación',`Mina:${t.mina?'X':''} Sup:${t.superficie?'X':''} Sub:${t.subterranea?'X':''}`],
          [],['ACEROS','Número','Desde','Hasta','Total'],
          ['Corona',t.coronaNum,t.coronaDesde,t.coronaHasta,t.coronaTotal],
          ['Escariador',t.escariadorNum,t.escariadorDesde,t.escariadorHasta,t.escariadorTotal],
          ['Barril',t.barrilNum,t.barrilDesde,t.barrilHasta,t.barrilTotal],
          [],['Prof. Inicio',t.profInicioTurno,'Prof. Fin',t.profFinTurno,'Total Metros',t.totalMetros],
          [],['ACTIVIDADES','B&B','Cliente'],
          ...t.actividades.map(a=>[a.label,a.bb,a.cliente]),
          ['TOTAL',t.totalHorasBB,t.totalHorasCliente],
          [],['BARRAS','N°','Desde','Hasta','Perforado','Recuperado','Retorno Agua'],
          ...t.barras.map(b=>['',b.nBarra,b.desde,b.hasta,b.perforado,b.recuperado,b.retornoAgua]),
          [],['ADITIVOS','Cantidad'],
          ...t.aditivos.map(a=>[a.nombre,a.cantidad]),
          [],['Agua (L)',t.consumoAgua,'Cachimba',t.nombreCachimba],
          [],['EQUIPOS','Patente','Horóm. Ini','Horóm. Fin','Total','Litros Diésel'],
          ...t.equipos.map(e=>['',e.patente,e.horomInicial,e.horomFinal,e.total,e.litros]),
          [],['OTROS A CONSIDERAR'],
          ['Barras',t.otrosBarras,'Barril',t.otrosBarril],
          ['"Muerto"',t.otrosMuerto,'Total Herrami.',t.otrosTotalHerramientas],
          ['Resta',t.otrosResta,'Fondo Pozo',t.otrosFondoPozo],
          [],['MATERIALES','Cantidad'],
          ...t.materiales.map(m=>[m.nombre,m.cantidad]),
          [],['OBSERVACIONES'],[t.observaciones],
        ];
        const ws=XLSX.utils.aoa_to_sheet(rows);
        ws['!cols']=[{wch:32},{wch:26},{wch:14},{wch:14},{wch:14}];
        XLSX.utils.book_append_sheet(wb,ws,`${s}-T${t.turno}`);
      });
    });
    XLSX.writeFile(wb,`Reporte_Perforacion_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const sendEmail=async()=>{
    if(!eTo)return;
    setSending(true);setEStatus('');
    try{
      const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,
          messages:[{role:'user',content:`Envía un correo a ${eTo} con asunto "${eSub||`Reporte Sonda ${cur.sonda} Turno ${cur.turno} — ${cur.dia}/${cur.mes}/${cur.anio}`}" con el siguiente contenido:\n\nSonda: ${cur.sonda} | Turno: ${cur.turno} | Fecha: ${cur.dia}/${cur.mes}/${cur.anio}\nCliente: ${cur.cliente} | Pozo: ${cur.nombrePozo}\nOperador: ${cur.operador}\nProfundidad: ${cur.profInicioTurno} → ${cur.profFinTurno} m (${cur.totalMetros} m perforados)\nObservaciones: ${cur.observaciones}`}],
          mcp_servers:[{type:'url',url:'https://gmail.mcp.claude.com/mcp',name:'gmail'}]})});
      const d=await r.json();
      if(d.error){setEStatus('Error: '+(d.error.message||'No se pudo enviar'));}
      else{setEStatus('Correo enviado correctamente ✓');setTimeout(()=>{setModal(false);setEStatus('');},2000);}
    }catch(e){setEStatus('Error de red: '+e.message);}
    finally{setSending(false);}
  };

  const ubicTxt=cur.mina?'Mina':cur.superficie?'Superficie':cur.subterranea?'Subterránea':'—';

  return(
    <div style={{fontFamily:'"Segoe UI",system-ui,sans-serif',background:CLR.bg,minHeight:'100vh'}}>

      {/* ── HEADER ── */}
      <div style={{background:CLR.navy,padding:'0 24px',position:'sticky',top:0,zIndex:200,boxShadow:'0 4px 18px rgba(0,0,0,0.3)',display:'flex',alignItems:'center',gap:0}}>
        <div style={{paddingRight:20,paddingTop:10,paddingBottom:10,borderRight:'1px solid rgba(255,255,255,0.12)',marginRight:20}}>
          <svg width="50" height="42" viewBox="0 0 50 42">
            <polygon points="25,3 5,39 45,39" fill="none" stroke={CLR.orange} strokeWidth="2.5" strokeLinejoin="round"/>
            <rect x="22.5" y="20" width="5" height="19" fill={CLR.orange} rx="1.5"/>
            <circle cx="25" cy="14" r="3.5" fill={CLR.orange}/>
            <line x1="12" y1="39" x2="38" y2="39" stroke={CLR.orange} strokeWidth="2.5"/>
            <circle cx="11" cy="39" r="1.5" fill={CLR.orange}/>
            <circle cx="39" cy="39" r="1.5" fill={CLR.orange}/>
          </svg>
        </div>
        <div>
          <div style={{color:CLR.white,fontWeight:900,fontSize:17,letterSpacing:'0.05em',lineHeight:1.2}}>PERFORTERRA ATACAMA</div>
          <div style={{color:'rgba(255,255,255,0.45)',fontSize:10,letterSpacing:'0.08em',textTransform:'uppercase'}}>Sistema de Gestión Integrado · R-SGI-SS-05 v2 · 12-02-2024</div>
        </div>
        <div style={{marginLeft:'auto',background:'rgba(255,255,255,0.07)',borderRadius:8,padding:'6px 16px',border:'1px solid rgba(255,255,255,0.12)'}}>
          <div style={{color:CLR.orange,fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>Reporte Diario de Perforación</div>
        </div>
      </div>

      {/* ── SONDA TABS ── */}
      <div style={{background:CLR.navyMid,display:'flex',gap:0,paddingLeft:24,overflowX:'auto',borderBottom:'3px solid rgba(0,0,0,0.2)'}}>
        {SONDAS.map(s=>(
          <button key={s} onClick={()=>{setSel(s);setTi(0);}}
            style={{padding:'12px 24px',fontSize:13,fontWeight:700,border:'none',cursor:'pointer',
              fontFamily:'inherit',letterSpacing:'0.05em',
              background:s===sel?CLR.orange:'transparent',
              color:s===sel?CLR.white:'rgba(255,255,255,0.55)',
              borderBottom:s===sel?`3px solid ${CLR.orangeHover}`:'3px solid transparent',
              transition:'all 0.15s',marginBottom:-3}}>
            ◉ Sonda {s}
          </button>
        ))}
      </div>

      {/* ── TURNO BAR ── */}
      <div style={{background:CLR.white,borderBottom:`3px solid ${CLR.orange}`,padding:'12px 24px',
        display:'flex',alignItems:'center',gap:10,boxShadow:'0 2px 8px rgba(0,0,0,0.06)',flexWrap:'wrap'}}>
        <span style={{fontSize:11,fontWeight:800,color:CLR.gray,textTransform:'uppercase',letterSpacing:'0.07em',marginRight:4}}>Turno:</span>
        {data[sel].turnos.map((t,i)=>(
          <button key={i} onClick={()=>setTi(i)}
            style={{padding:'8px 22px',fontSize:13,fontWeight:800,borderRadius:8,cursor:'pointer',
              fontFamily:'inherit',border:`2px solid ${i===ti?CLR.orange:CLR.border}`,
              background:i===ti?CLR.orange:CLR.white,color:i===ti?CLR.white:CLR.gray,transition:'all 0.15s',
              boxShadow:i===ti?`0 3px 10px rgba(232,82,10,0.35)`:'none'}}>
            Turno {t.turno}
          </button>
        ))}
        <button onClick={()=>{
          setData(p=>({...p,[sel]:{...p[sel],turnos:[...p[sel].turnos,mkTurno({turno:String.fromCharCode(65+p[sel].turnos.length),dia:cur.dia,mes:cur.mes,anio:cur.anio,sonda:sel,cliente:cur.cliente})]}}));
          setTi(data[sel].turnos.length);
        }} style={{padding:'8px 16px',fontSize:12,fontWeight:700,borderRadius:8,border:`2px dashed ${CLR.borderStrong}`,
          background:'transparent',color:CLR.gray,cursor:'pointer',fontFamily:'inherit'}}>
          + Turno
        </button>
        {/* Stats rápidos */}
        <div style={{marginLeft:'auto',display:'flex',gap:8,flexWrap:'wrap'}}>
          {[['Inicio',cur.profInicioTurno,'m',CLR.teal],['Fin',cur.profFinTurno,'m',CLR.teal],['Perforado',cur.totalMetros,'m',CLR.orange],['Ubicación',ubicTxt,'',CLR.navyMid]].map(([l,v,u,ac])=>(
            <div key={l} style={{background:CLR.white,border:`2px solid ${ac}`,borderRadius:8,padding:'5px 12px',textAlign:'center',minWidth:72}}>
              <div style={{fontSize:9,fontWeight:800,color:ac,textTransform:'uppercase',letterSpacing:'0.05em'}}>{l}</div>
              <div style={{fontSize:15,fontWeight:900,color:CLR.navy}}>{v||'—'}{u&&<span style={{fontSize:10,fontWeight:500}}> {u}</span>}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div style={{padding:'20px 24px 110px',maxWidth:1320,margin:'0 auto'}}>

        {/* INFO GENERAL */}
        <Card sk="personal" title="Información General del Turno">
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:14}}>
            {[['Cliente','cliente'],['Asesor en Prevención','asesorPrevencion'],['Jefe de Operaciones','jefeOperaciones'],
              ['Jefe de Turno','jefeturno'],['Operador','operador'],['Nombre del Pozo','nombrePozo'],
              ['Ayudante 1','ayudante1'],['Ayudante 2','ayudante2'],['Volante','volante'],
              ['Inclinación','inclinacion'],['Azimut','azimut'],['Sector','sector'],
              ['Fondo de Programa','fondoPrograma'],['Sonda N°','sonda'],['Diámetro del Pozo','diametroPozo']
            ].map(([l,k])=><Field key={k} label={l} value={cur[k]} onChange={v=>upd(k,v)}/>)}
          </div>
          <div style={{background:CLR.white,borderRadius:10,padding:'14px 18px',border:`1.5px solid ${CLR.border}`,display:'flex',gap:24,flexWrap:'wrap',alignItems:'center'}}>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <span style={{fontSize:11,fontWeight:800,color:CLR.gray,textTransform:'uppercase',letterSpacing:'0.06em'}}>Turno</span>
              <input value={cur.turno} onChange={e=>upd('turno',e.target.value)} style={inp({width:48,textAlign:'center',fontWeight:800,fontSize:16})}
                onFocus={e=>e.target.style.borderColor=CLR.orange} onBlur={e=>e.target.style.borderColor=CLR.border}/>
            </div>
            <div style={{display:'flex',gap:6,alignItems:'center'}}>
              <span style={{fontSize:11,fontWeight:800,color:CLR.gray,textTransform:'uppercase',letterSpacing:'0.06em'}}>Fecha</span>
              {[['Día','dia',46],['Mes','mes',46],['Año','anio',64]].map(([l,k,w])=>(
                <input key={k} placeholder={l} value={cur[k]} onChange={e=>upd(k,e.target.value)}
                  style={inp({width:w,textAlign:'center',fontWeight:700,fontSize:14})}
                  onFocus={e=>e.target.style.borderColor=CLR.orange} onBlur={e=>e.target.style.borderColor=CLR.border}/>
              ))}
            </div>
            <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
              <span style={{fontSize:11,fontWeight:800,color:CLR.gray,textTransform:'uppercase',letterSpacing:'0.06em'}}>Ubicación Plataforma</span>
              {[['Mina','mina',CLR.amber],['Superficie','superficie',CLR.teal],['Subterránea','subterranea',CLR.navy]].map(([l,k,ac])=>(
                <label key={k} style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer',
                  padding:'7px 14px',borderRadius:8,border:`2px solid ${cur[k]?ac:CLR.border}`,
                  background:cur[k]?`${ac}18`:CLR.white,transition:'all 0.15s'}}>
                  <input type="checkbox" checked={!!cur[k]} onChange={e=>upd(k,e.target.checked)} style={{accentColor:ac,width:15,height:15}}/>
                  <span style={{fontSize:12,fontWeight:700,color:cur[k]?ac:CLR.gray}}>{l}</span>
                </label>
              ))}
            </div>
          </div>
        </Card>

        {/* ACEROS + PROFUNDIDADES */}
        <div style={{display:'grid',gridTemplateColumns:'3fr 2fr',gap:18,marginBottom:0}}>
          <Card sk="aceros" title="Aceros de Perforación">
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'separate',borderSpacing:'0 8px',minWidth:520}}>
                <thead><tr>
                  {['Tipo de Acero','N° Acero','Desde (m)','Hasta (m)','Total Acumulado'].map(h=>(
                    <th key={h} style={{padding:'4px 10px',textAlign:'left',fontSize:10,fontWeight:800,color:CLR.orange,textTransform:'uppercase',letterSpacing:'0.06em'}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {[['🔶 Corona','coronaNum','coronaDesde','coronaHasta','coronaTotal'],
                    ['🔷 Escariador','escariadorNum','escariadorDesde','escariadorHasta','escariadorTotal'],
                    ['🔸 Barril','barrilNum','barrilDesde','barrilHasta','barrilTotal'],
                  ].map(([lbl,...flds])=>(
                    <tr key={lbl}>
                      <td style={{padding:'6px 12px',fontWeight:700,fontSize:13,color:CLR.navy,background:CLR.white,borderRadius:'8px 0 0 8px',border:`2px solid ${CLR.border}`,borderRight:'none',whiteSpace:'nowrap'}}>{lbl}</td>
                      {flds.map((f,fi)=>(
                        <td key={f} style={{padding:'4px 5px',background:CLR.white,border:`2px solid ${CLR.border}`,borderLeft:'none',borderRight:fi===3?`2px solid ${CLR.border}`:'none',borderRadius:fi===3?'0 8px 8px 0':undefined}}>
                          <TdIn val={cur[f]} onChange={v=>upd(f,v)} center={fi>0}/>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card sk="profund" title="Profundidades y Horas">
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
              <StatPill label="Prof. Inicio Turno" value={`${cur.profInicioTurno} m`} accent={CLR.teal}/>
              <StatPill label="Prof. Fin Turno"    value={`${cur.profFinTurno} m`}    accent={CLR.teal}/>
              <StatPill label="Metros Perforados"  value={`${cur.totalMetros} m`}     accent={CLR.orange}/>
              <StatPill label="Total Horas B&B"    value={`${cur.totalHorasBB} hrs`}  accent={CLR.purple}/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <Field label="Prof. Inicio Turno" value={cur.profInicioTurno} onChange={v=>upd('profInicioTurno',v)} sm/>
              <Field label="Prof. Fin Turno"    value={cur.profFinTurno}    onChange={v=>upd('profFinTurno',v)}    sm/>
              <Field label="Total Metros Perf." value={cur.totalMetros}     onChange={v=>upd('totalMetros',v)}     sm/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                <Field label="Horas B&B"    value={cur.totalHorasBB}      onChange={v=>upd('totalHorasBB',v)}      sm/>
                <Field label="Hrs. Cliente" value={cur.totalHorasCliente} onChange={v=>upd('totalHorasCliente',v)} sm/>
              </div>
            </div>
          </Card>
        </div>

        {/* ACTIVIDADES */}
        <Card sk="actividades" title="Actividades — Distribución de Horas de Cargo">
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
            {cur.actividades.map((a,i)=>{
              const on=a.bb||a.cliente;
              return(
                <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 10px',borderRadius:8,
                  background:on?CLR.purpleLight:CLR.white,border:`1.5px solid ${on?CLR.purple:CLR.border}`,transition:'all 0.15s'}}>
                  <span style={{flex:1,fontSize:12,fontWeight:on?700:400,color:on?CLR.purple:CLR.gray}}>{a.label}</span>
                  <div style={{display:'flex',gap:6}}>
                    {[['B&B','bb',CLR.purple],['Cliente','cliente',CLR.orange]].map(([lab,k,ac])=>(
                      <div key={k} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:1}}>
                        <span style={{fontSize:9,fontWeight:800,color:CLR.gray,textTransform:'uppercase'}}>{lab}</span>
                        <input value={a[k]} onChange={e=>updArr('actividades',i,k,e.target.value)}
                          style={{width:46,padding:'5px 6px',fontSize:13,fontWeight:700,textAlign:'center',
                            borderRadius:6,border:`2px solid ${a[k]?ac:CLR.border}`,
                            background:a[k]?`${ac}22`:CLR.white,color:a[k]?ac:CLR.navy,
                            fontFamily:'inherit',outline:'none'}}
                          onFocus={e=>e.target.style.borderColor=ac} onBlur={e=>e.target.style.borderColor=a[k]?ac:CLR.border}/>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{marginTop:12,display:'flex',gap:12,padding:'12px 16px',background:CLR.white,
            borderRadius:10,border:`2px solid ${CLR.purple}`,alignItems:'center'}}>
            <span style={{flex:1,fontSize:12,fontWeight:800,color:CLR.purple,textTransform:'uppercase',letterSpacing:'0.06em'}}>Total Horas Actividades</span>
            {[['B&B',cur.totalHorasBB,'totalHorasBB',CLR.purple],['Cliente',cur.totalHorasCliente,'totalHorasCliente',CLR.orange]].map(([l,v,k,ac])=>(
              <div key={k} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                <span style={{fontSize:10,fontWeight:800,color:ac,textTransform:'uppercase',letterSpacing:'0.05em'}}>{l}</span>
                <input value={v} onChange={e=>upd(k,e.target.value)}
                  style={{width:66,padding:'8px 6px',fontSize:18,fontWeight:900,textAlign:'center',
                    borderRadius:8,border:`2px solid ${ac}`,background:`${ac}18`,color:ac,fontFamily:'inherit',outline:'none'}}/>
              </div>
            ))}
          </div>
        </Card>

        {/* BARRAS */}
        <Card sk="barras" title="Registro de Barras Perforadas">
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'separate',borderSpacing:'0 6px',minWidth:720}}>
              <thead><tr>
                {['N° Barra','Desde (m)','Hasta (m)','Perforado (m)','% Recuperado','% Retorno Agua',''].map(h=>(
                  <th key={h} style={{padding:'5px 10px',textAlign:'left',fontSize:10,fontWeight:800,color:CLR.blue,textTransform:'uppercase',letterSpacing:'0.06em'}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {cur.barras.map((b,i)=>{
                  const rec=parseFloat(b.recuperado);
                  const hiRec=!isNaN(rec)&&rec>=80;
                  return(
                    <tr key={i}>
                      {['nBarra','desde','hasta','perforado'].map((k,ki)=>(
                        <td key={k} style={{padding:'3px 4px',background:CLR.white,border:`2px solid ${CLR.border}`,
                          borderRight:'none',borderLeft:ki===0?`2px solid ${CLR.border}`:'none',
                          borderRadius:ki===0?'8px 0 0 8px':undefined}}>
                          <TdIn val={b[k]} onChange={v=>updArr('barras',i,k,v)} center={ki>0}/>
                        </td>
                      ))}
                      <td style={{padding:'3px 4px',background:hiRec?CLR.greenLight:CLR.white,border:`2px solid ${hiRec?CLR.green:CLR.border}`,borderLeft:'none',borderRight:'none'}}>
                        <TdIn val={b.recuperado} onChange={v=>updArr('barras',i,'recuperado',v)} center/>
                      </td>
                      <td style={{padding:'3px 4px',background:CLR.white,border:`2px solid ${CLR.border}`,borderLeft:'none',borderRight:`2px solid ${CLR.border}`}}>
                        <TdIn val={b.retornoAgua} onChange={v=>updArr('barras',i,'retornoAgua',v)} center/>
                      </td>
                      <td style={{padding:'3px 6px',background:CLR.white,border:`2px solid ${CLR.border}`,borderLeft:'none',borderRadius:'0 8px 8px 0'}}>
                        <XBtn onClick={()=>delRow('barras',i)}/>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <PlusBtn label="Agregar barra" onClick={()=>addRow('barras',{nBarra:'',desde:'',hasta:'',perforado:'',recuperado:'',retornoAgua:''})}/>
        </Card>

        {/* ADITIVOS + AGUA/RESIDUOS + OTROS */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:18,marginBottom:0}}>
          <Card sk="aditivos" title="Aditivos Utilizados">
            {cur.aditivos.map((a,i)=>(
              <div key={i} style={{display:'flex',gap:6,alignItems:'center',marginBottom:6,
                background:CLR.white,borderRadius:8,padding:'7px 10px',border:`1.5px solid ${CLR.border}`}}>
                <TdIn val={a.nombre} onChange={v=>updArr('aditivos',i,'nombre',v)}/>
                <input value={a.cantidad} onChange={e=>updArr('aditivos',i,'cantidad',e.target.value)}
                  style={{width:72,padding:'7px 8px',fontSize:13,fontWeight:800,textAlign:'center',
                    borderRadius:7,border:`2px solid ${CLR.green}`,background:CLR.greenLight,
                    color:CLR.green,fontFamily:'inherit',outline:'none'}}/>
                <XBtn onClick={()=>delRow('aditivos',i)}/>
              </div>
            ))}
            <PlusBtn label="Agregar aditivo" onClick={()=>addRow('aditivos',{nombre:'',cantidad:''})}/>
          </Card>

          <Card sk="otros" title="Agua y Residuos">
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <Field label="Consumo de Agua (Litros)" value={cur.consumoAgua}    onChange={v=>upd('consumoAgua',v)}/>
              <Field label="Nombre La Cachimba"       value={cur.nombreCachimba} onChange={v=>upd('nombreCachimba',v)}/>
              <div style={{background:CLR.white,border:`1.5px solid ${CLR.border}`,borderRadius:10,padding:'12px 14px'}}>
                <div style={{fontSize:10,fontWeight:800,color:CLR.gray,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8}}>Residuos Generados (kg)</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {[['Domiciliarios','domiciliarios'],['Industriales','industriales'],['Reciclables','reciclables'],['Peligrosos','peligrosos']].map(([l,k])=>(
                    <Field key={k} label={l} value={cur[k]} onChange={v=>upd(k,v)} sm/>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card sk="otros" title="Otros a Considerar">
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {[['Barras','otrosBarras'],['Barril','otrosBarril'],['"Muerto"','otrosMuerto'],
                ['Total Herramientas','otrosTotalHerramientas'],['Resta','otrosResta'],['Fondo Pozo','otrosFondoPozo']].map(([l,k])=>(
                <div key={k} style={{display:'flex',gap:8,alignItems:'center'}}>
                  <span style={{fontSize:11,fontWeight:800,color:CLR.gray,textTransform:'uppercase',letterSpacing:'0.04em',minWidth:112,flex:'0 0 112px'}}>{l}</span>
                  <input value={cur[k]} onChange={e=>upd(k,e.target.value)} style={inp({fontSize:13,fontWeight:600})}
                    onFocus={e=>e.target.style.borderColor=CLR.orange} onBlur={e=>e.target.style.borderColor=CLR.border}/>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* EQUIPOS */}
        <Card sk="equipos" title="Equipos en Faena (Patente / N° Interno)">
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'separate',borderSpacing:'0 6px',minWidth:700}}>
              <thead><tr>
                {['Patente / N° Interno','Horóm. Inicial','Horóm. Final','Total (Hrs/Kms)','Litros Diésel',''].map(h=>(
                  <th key={h} style={{padding:'5px 10px',textAlign:'left',fontSize:10,fontWeight:800,color:CLR.amber,textTransform:'uppercase',letterSpacing:'0.06em'}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {cur.equipos.map((e,i)=>(
                  <tr key={i}>
                    <td style={{padding:'3px 4px',background:CLR.white,border:`2px solid ${CLR.border}`,borderRight:'none',borderRadius:'8px 0 0 8px'}}>
                      <TdIn val={e.patente} onChange={v=>updArr('equipos',i,'patente',v)}/>
                    </td>
                    {['horomInicial','horomFinal','total'].map(k=>(
                      <td key={k} style={{padding:'3px 4px',background:CLR.white,border:`2px solid ${CLR.border}`,borderLeft:'none',borderRight:'none'}}>
                        <TdIn val={e[k]} onChange={v=>updArr('equipos',i,k,v)} center/>
                      </td>
                    ))}
                    <td style={{padding:'3px 4px',background:e.litros?CLR.amberLight:CLR.white,border:`2px solid ${e.litros?CLR.amber:CLR.border}`,borderLeft:'none',borderRight:`2px solid ${e.litros?CLR.amber:CLR.border}`}}>
                      <TdIn val={e.litros} onChange={v=>updArr('equipos',i,'litros',v)} center hi={!!e.litros}/>
                    </td>
                    <td style={{padding:'3px 6px',background:CLR.white,border:`2px solid ${CLR.border}`,borderLeft:'none',borderRadius:'0 8px 8px 0'}}>
                      <XBtn onClick={()=>delRow('equipos',i)}/>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PlusBtn label="Agregar equipo" onClick={()=>addRow('equipos',{patente:'',horomInicial:'',horomFinal:'',total:'',litros:''})}/>
        </Card>

        {/* MATERIALES */}
        <Card sk="aditivos" title="Materiales / Lubricantes y Otros">
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:8}}>
            {cur.materiales.map((m,i)=>(
              <div key={i} style={{display:'flex',gap:6,alignItems:'center',background:CLR.white,borderRadius:8,padding:'7px 10px',border:`1.5px solid ${CLR.border}`}}>
                <TdIn val={m.nombre} onChange={v=>updArr('materiales',i,'nombre',v)}/>
                <input value={m.cantidad} onChange={e=>updArr('materiales',i,'cantidad',e.target.value)}
                  style={{width:64,padding:'7px 8px',fontSize:13,fontWeight:800,textAlign:'center',
                    borderRadius:7,border:`2px solid ${CLR.teal}`,background:CLR.tealLight,
                    color:CLR.teal,fontFamily:'inherit',outline:'none'}}/>
                <XBtn onClick={()=>delRow('materiales',i)}/>
              </div>
            ))}
          </div>
          <PlusBtn label="Agregar material" onClick={()=>addRow('materiales',{nombre:'',cantidad:''})}/>
        </Card>

        {/* OBSERVACIONES */}
        <Card sk="obs" title="Observaciones del Turno">
          <textarea value={cur.observaciones} onChange={e=>upd('observaciones',e.target.value)} rows={5}
            style={{width:'100%',padding:'14px 16px',fontSize:14,lineHeight:1.75,fontFamily:'inherit',
              borderRadius:10,border:`2px solid ${CLR.border}`,background:CLR.white,color:CLR.navy,
              resize:'vertical',boxSizing:'border-box',outline:'none'}}
            onFocus={e=>e.target.style.borderColor=CLR.navy} onBlur={e=>e.target.style.borderColor=CLR.border}
            placeholder="Ingrese las observaciones del turno aquí..."/>
        </Card>

      </div>

      {/* ── ACTION BAR ── */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,background:CLR.navy,
        borderTop:`3px solid ${CLR.orange}`,padding:'13px 24px',display:'flex',
        alignItems:'center',gap:12,zIndex:300,boxShadow:'0 -4px 20px rgba(0,0,0,0.25)'}}>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <div style={{background:CLR.orange,borderRadius:6,padding:'4px 12px'}}>
            <span style={{color:CLR.white,fontSize:12,fontWeight:800,letterSpacing:'0.06em'}}>Sonda {sel}</span>
          </div>
          <div style={{background:'rgba(255,255,255,0.1)',borderRadius:6,padding:'4px 12px'}}>
            <span style={{color:CLR.white,fontSize:12,fontWeight:700}}>Turno {cur.turno}</span>
          </div>
          <span style={{color:'rgba(255,255,255,0.4)',fontSize:12}}>{cur.dia}/{cur.mes}/{cur.anio} · {cur.cliente}</span>
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:10}}>
          <button onClick={()=>{setESub(`Reporte Perforación — Sonda ${cur.sonda} Turno ${cur.turno} — ${cur.dia}/${cur.mes}/${cur.anio}`);setModal(true);}}
            style={{padding:'10px 20px',fontSize:13,fontWeight:700,borderRadius:9,border:'2px solid rgba(255,255,255,0.3)',
              background:'rgba(255,255,255,0.08)',color:CLR.white,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:6}}>
            ✉️ Enviar por Correo
          </button>
          <button onClick={exportXLS}
            style={{padding:'10px 24px',fontSize:13,fontWeight:800,borderRadius:9,border:'none',
              background:CLR.orange,color:CLR.white,cursor:'pointer',fontFamily:'inherit',
              display:'flex',alignItems:'center',gap:6,boxShadow:`0 3px 12px rgba(232,82,10,0.5)`}}>
            📊 Descargar Excel — Todos los Reportes
          </button>
        </div>
      </div>

      {/* ── MODAL EMAIL ── */}
      {modal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',display:'flex',
          alignItems:'center',justifyContent:'center',zIndex:500}}
          onClick={e=>{if(e.target===e.currentTarget)setModal(false)}}>
          <div style={{background:CLR.white,borderRadius:18,padding:30,width:460,
            boxShadow:'0 24px 60px rgba(0,0,0,0.35)',border:`3px solid ${CLR.orange}`}}>
            <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:22}}>
              <div style={{width:46,height:46,background:CLR.orange,borderRadius:12,
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>✉️</div>
              <div>
                <div style={{fontSize:16,fontWeight:900,color:CLR.navy}}>Enviar Reporte por Correo</div>
                <div style={{fontSize:12,color:CLR.gray}}>Sonda {cur.sonda} · Turno {cur.turno} · {cur.dia}/{cur.mes}/{cur.anio}</div>
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <Field label="Para (dirección de correo electrónico)" value={eTo} onChange={setETo}/>
              <Field label="Asunto" value={eSub} onChange={setESub}/>
              <div style={{background:CLR.navyLight,borderRadius:10,padding:'12px 14px',border:`1.5px solid ${CLR.border}`}}>
                <div style={{fontSize:10,fontWeight:800,color:CLR.navyMid,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6}}>Resumen del reporte a enviar</div>
                <div style={{fontSize:13,color:CLR.navy,lineHeight:1.7}}>
                  <strong>Sonda:</strong> {cur.sonda} | <strong>Turno:</strong> {cur.turno}<br/>
                  <strong>Pozo:</strong> {cur.nombrePozo}<br/>
                  <strong>Profundidad:</strong> {cur.profInicioTurno} → {cur.profFinTurno} m · {cur.totalMetros} m perf.
                </div>
              </div>
              {eStatus&&<div style={{padding:'10px 14px',borderRadius:8,fontSize:13,fontWeight:700,
                background:eStatus.includes('Error')?CLR.redLight:CLR.greenLight,
                color:eStatus.includes('Error')?CLR.red:CLR.green,
                border:`1.5px solid ${eStatus.includes('Error')?CLR.red:CLR.green}`}}>{eStatus}</div>}
              <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:4}}>
                <button onClick={()=>setModal(false)}
                  style={{padding:'10px 20px',fontSize:13,fontWeight:700,borderRadius:9,
                    border:`2px solid ${CLR.border}`,background:'transparent',color:CLR.gray,cursor:'pointer',fontFamily:'inherit'}}>
                  Cancelar
                </button>
                <button onClick={sendEmail} disabled={sending||!eTo}
                  style={{padding:'10px 24px',fontSize:13,fontWeight:800,borderRadius:9,border:'none',
                    background:(!eTo||sending)?CLR.borderStrong:CLR.orange,
                    color:CLR.white,cursor:(!eTo||sending)?'not-allowed':'pointer',fontFamily:'inherit',
                    boxShadow:(!eTo||sending)?'none':`0 3px 10px rgba(232,82,10,0.4)`}}>
                  {sending?'Enviando...':'Enviar Correo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

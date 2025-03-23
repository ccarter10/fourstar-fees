(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{245:function(e,t,a){e.exports=a(470)},254:function(e,t,a){},470:function(e,t,a){"use strict";a.r(t);var n=a(0),l=a.n(n),r=a(230),s=a.n(r),m=(a(254),a(472)),c=a(474),o=a(473),i=a(242),u=a(243),d=a(42),g=a(58),b=a(241);var E=()=>{const[e,t]=Object(n.useState)(1e4),[a,r]=Object(n.useState)(5e3),[s,E]=Object(n.useState)(30),[p,v]=Object(n.useState)(7),[f,y]=Object(n.useState)(2),[h,x]=Object(n.useState)(0),[N,w]=Object(n.useState)(0),[F,S]=Object(n.useState)(0),[k,C]=Object(n.useState)(0),[I,j]=Object(n.useState)(0),[R,T]=Object(n.useState)([]),[D,O]=Object(n.useState)(!1),A=(e,t,a,n,l)=>{const r=(n-l)/100;let s=e;for(let m=0;m<a;m++)s=s*(1+r)+t;return s},U=e=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",minimumFractionDigits:0,maximumFractionDigits:0}).format(e);return l.a.createElement("div",{className:"min-h-screen bg-gray-50 py-8"},l.a.createElement("div",{className:"max-w-6xl mx-auto px-4"},l.a.createElement("header",{className:"text-center mb-12"},l.a.createElement("h1",{className:"text-4xl font-bold text-gray-900 mb-2"},"FourStar Fees"),l.a.createElement("p",{className:"text-xl text-gray-600"},"Understand how investment fees impact your long-term returns")),l.a.createElement("div",{className:"bg-white rounded-lg shadow-lg p-6 mb-8"},l.a.createElement("h2",{className:"text-2xl font-semibold text-gray-800 mb-6"},"Investment Fee Calculator"),l.a.createElement("div",{className:"grid md:grid-cols-2 gap-8"},l.a.createElement("div",{className:"space-y-6"},l.a.createElement("div",null,l.a.createElement("label",{htmlFor:"initialInvestment",className:"block text-sm font-medium text-gray-700 mb-1"},"Initial Investment"),l.a.createElement("div",{className:"relative mt-1 rounded-md shadow-sm"},l.a.createElement("div",{className:"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"},l.a.createElement("span",{className:"text-gray-500 sm:text-sm"},"$")),l.a.createElement("input",{type:"number",id:"initialInvestment",className:"focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border",value:e,onChange:e=>t(Number(e.target.value)),min:"0"}))),l.a.createElement("div",null,l.a.createElement("label",{htmlFor:"annualContribution",className:"block text-sm font-medium text-gray-700 mb-1"},"Annual Contribution"),l.a.createElement("div",{className:"relative mt-1 rounded-md shadow-sm"},l.a.createElement("div",{className:"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"},l.a.createElement("span",{className:"text-gray-500 sm:text-sm"},"$")),l.a.createElement("input",{type:"number",id:"annualContribution",className:"focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border",value:a,onChange:e=>r(Number(e.target.value)),min:"0"}))),l.a.createElement("div",null,l.a.createElement("label",{htmlFor:"investmentPeriod",className:"block text-sm font-medium text-gray-700 mb-1"},"Investment Period (years)"),l.a.createElement("input",{type:"number",id:"investmentPeriod",className:"focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border",value:s,onChange:e=>E(Number(e.target.value)),min:"1",max:"100"}))),l.a.createElement("div",{className:"space-y-6"},l.a.createElement("div",null,l.a.createElement("label",{htmlFor:"expectedReturn",className:"block text-sm font-medium text-gray-700 mb-1"},"Expected Annual Return (%)"),l.a.createElement("div",{className:"relative mt-1 rounded-md shadow-sm"},l.a.createElement("input",{type:"number",id:"expectedReturn",className:"focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md p-2 border",value:p,onChange:e=>v(Number(e.target.value)),min:"0",max:"50",step:"0.1"}),l.a.createElement("div",{className:"absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"},l.a.createElement("span",{className:"text-gray-500 sm:text-sm"},"%")))),l.a.createElement("div",null,l.a.createElement("label",{htmlFor:"annualFee",className:"block text-sm font-medium text-gray-700 mb-1"},"Annual Fee (%)"),l.a.createElement("div",{className:"relative mt-1 rounded-md shadow-sm"},l.a.createElement("input",{type:"number",id:"annualFee",className:"focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md p-2 border",value:f,onChange:e=>y(Number(e.target.value)),min:"0",max:"20",step:"0.1"}),l.a.createElement("div",{className:"absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"},l.a.createElement("span",{className:"text-gray-500 sm:text-sm"},"%")))),l.a.createElement("div",{className:"pt-4"},l.a.createElement("button",{onClick:()=>{const t=A(e,a,s,p,0),n=A(e,a,s,p,f),l=t-n,r=l/t*100,m=100-r;x(t),w(n),S(l),C(r),j(m);const c=[];for(let o=0;o<=s;o++){const t=A(e,a,o,p,0),n=A(e,a,o,p,f);c.push({year:o,withoutFees:Math.round(t),withFees:Math.round(n)})}T(c),O(!0)},className:"w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"},"Calculate Impact"))))),D&&l.a.createElement("div",{className:"bg-white rounded-lg shadow-lg p-6 mb-8"},l.a.createElement("h2",{className:"text-2xl font-semibold text-gray-800 mb-6"},"Results"),l.a.createElement("div",{className:"grid md:grid-cols-2 gap-8"},l.a.createElement("div",null,l.a.createElement("div",{className:"bg-gray-50 rounded-lg p-6 mb-6"},l.a.createElement("h3",{className:"text-xl font-medium text-gray-700 mb-4"},"T-Rex Score: ",I.toFixed(1),"%"),l.a.createElement("p",{className:"text-gray-600 mb-4"},"Your T-Rex Score shows what percentage of your potential returns you actually keep. Higher is better; the rest goes to fees."),l.a.createElement("div",{className:"space-y-3"},l.a.createElement("div",null,l.a.createElement("div",{className:"flex justify-between text-sm mb-1"},l.a.createElement("span",null,"Investment without fees:"),l.a.createElement("span",{className:"font-medium"},U(h))),l.a.createElement("div",{className:"w-full bg-green-100 rounded-full h-4"},l.a.createElement("div",{className:"bg-green-500 h-4 rounded-full",style:{width:"100%"}}))),l.a.createElement("div",null,l.a.createElement("div",{className:"flex justify-between text-sm mb-1"},l.a.createElement("span",null,"Investment with fees:"),l.a.createElement("span",{className:"font-medium"},U(N))),l.a.createElement("div",{className:"w-full bg-green-100 rounded-full h-4"},l.a.createElement("div",{className:"bg-green-500 h-4 rounded-full",style:{width:`${I}%`}}))),l.a.createElement("div",null,l.a.createElement("div",{className:"flex justify-between text-sm mb-1"},l.a.createElement("span",null,"Total fees paid:"),l.a.createElement("span",{className:"font-medium text-red-500"},U(F))),l.a.createElement("div",{className:"w-full bg-red-100 rounded-full h-4"},l.a.createElement("div",{className:"bg-red-500 h-4 rounded-full",style:{width:`${k}%`}}))))),l.a.createElement("div",{className:"text-gray-600 text-sm"},l.a.createElement("p",{className:"mb-2"},l.a.createElement("strong",null,"Fee impact:")," ",k.toFixed(1),"% of your potential returns"),l.a.createElement("p",null,"An annual fee of ",f,"% might seem small, but over ",s," years it consumes ",U(F)," of your potential ",U(h)," investment value."))),l.a.createElement("div",null,l.a.createElement("h3",{className:"text-xl font-medium text-gray-700 mb-4"},"Investment Growth Comparison"),l.a.createElement("div",{className:"h-64 md:h-80"},l.a.createElement(m.a,{width:"100%",height:"100%"},l.a.createElement(c.a,{data:R,margin:{top:5,right:30,left:20,bottom:5}},l.a.createElement(o.a,{strokeDasharray:"3 3"}),l.a.createElement(i.a,{dataKey:"year",label:{value:"Years",position:"insideBottomRight",offset:-10}}),l.a.createElement(u.a,{tickFormatter:e=>e.toLocaleString("en-US",{style:"currency",currency:"USD",minimumFractionDigits:0,maximumFractionDigits:0,notation:"compact"})}),l.a.createElement(d.a,{formatter:e=>[e.toLocaleString("en-US",{style:"currency",currency:"USD",minimumFractionDigits:0,maximumFractionDigits:0}),""],labelFormatter:e=>`Year ${e}`}),l.a.createElement(g.a,null),l.a.createElement(b.a,{type:"monotone",dataKey:"withoutFees",name:"Without Fees",stroke:"#10B981",strokeWidth:2,activeDot:{r:8}}),l.a.createElement(b.a,{type:"monotone",dataKey:"withFees",name:"With Fees",stroke:"#EF4444",strokeWidth:2}))))))),l.a.createElement("div",{className:"bg-white rounded-lg shadow-lg p-6 mb-8"},l.a.createElement("h2",{className:"text-2xl font-semibold text-gray-800 mb-4"},"Understanding Investment Fees"),l.a.createElement("div",{className:"prose max-w-none"},l.a.createElement("p",null,"Investment fees might seem small at first glance, but their impact compounds dramatically over time. A difference of just 1-2% in annual fees can reduce your final investment value by 20-40% over several decades."),l.a.createElement("h3",null,"Types of Investment Fees"),l.a.createElement("ul",null,l.a.createElement("li",null,l.a.createElement("strong",null,"Management Expense Ratio (MER):")," Annual fee charged by mutual funds and ETFs"),l.a.createElement("li",null,l.a.createElement("strong",null,"Advisory Fees:")," Charges for investment advice and portfolio management"),l.a.createElement("li",null,l.a.createElement("strong",null,"Trading Commissions:")," Costs per transaction when buying or selling investments"),l.a.createElement("li",null,l.a.createElement("strong",null,"Account Fees:")," Administrative charges for maintaining your investment account")),l.a.createElement("h3",null,"The T-Rex Score"),l.a.createElement("p",null,"The T-Rex Score was developed by Larry Bates to help investors understand the true impact of fees. It represents the percentage of your potential investment returns that you actually keep, with the rest being consumed by fees. A higher score is better\u2014ideally, you want to keep as much of your returns as possible."),l.a.createElement("h3",null,"How to Improve Your T-Rex Score"),l.a.createElement("ul",null,l.a.createElement("li",null,"Consider low-cost index funds or ETFs instead of actively managed funds"),l.a.createElement("li",null,"Compare fee structures when selecting investment platforms"),l.a.createElement("li",null,'Be wary of "hidden" fees that may not be immediately obvious'),l.a.createElement("li",null,"Review your investment costs annually to ensure they remain competitive")))),l.a.createElement("footer",{className:"text-center text-gray-500 text-sm mt-12"},l.a.createElement("p",null,"FourStar Fees | Investment Fee Impact Calculator"),l.a.createElement("p",{className:"mt-1"},"Inspired by Larry Bates' T-Rex Score concept"))))};var p=e=>{e&&e instanceof Function&&a.e(3).then(a.bind(null,475)).then(t=>{let{getCLS:a,getFID:n,getFCP:l,getLCP:r,getTTFB:s}=t;a(e),n(e),l(e),r(e),s(e)})};s.a.createRoot(document.getElementById("root")).render(l.a.createElement(l.a.StrictMode,null,l.a.createElement(E,null))),p()}},[[245,1,2]]]);
//# sourceMappingURL=main.a04c0ee4.chunk.js.map
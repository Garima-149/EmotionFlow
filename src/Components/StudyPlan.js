import { useEffect, useState } from "react";
import '../Styles/global.css';
import '../Styles/studyplan.css';
import '../Styles/navbar.css';

export default function StudyPlan() {

  const [plan, setPlan] = useState(null);

  useEffect(() => {
  const loadPlan = () => {
    try {
      const stored = localStorage.getItem("studyPlan");

      if (stored && stored !== "undefined") {
        setPlan(JSON.parse(stored));
      } else {
        setPlan(null);
      }
    } catch (err) {
      console.log("Invalid JSON in localStorage");
      setPlan(null);
    }
  };

  loadPlan(); // initial load

  // ✅ listen for updates
  window.addEventListener("studyPlanUpdated", loadPlan);

  return () => {
    window.removeEventListener("studyPlanUpdated", loadPlan);
  };
}, []);

  if (!plan) {
    return (
      <div className='study-plan-page'>
        <div className="card">
          <h2>No Study Plan Yet</h2>
          <p style={{color:"black"}}>Please detect your emotion first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='study-plan-page'>
      <div className="card">
        <h2>Today's Study Plan</h2>

        <ul>
          {plan.do?.map((item, i) => (
            <li key={i}>✔ {item}</li>
          ))}

          {plan.avoid?.map((item, i) => (
            <li key={i}>❌ {item}</li>
          ))}
        </ul>

      </div>
    </div>
  );
}

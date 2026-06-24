import React, { useState } from 'react';
import { useNotificationCenter } from '../../context/NotificationCenterContext';
import { SectionHeader } from '../../components/SectionHeader';
import { 
  GitBranch, Play, Trash2, Plus, Clock, 
  Sliders, ShieldAlert, Cpu, Check, Activity, AlertTriangle
} from 'lucide-react';

export const WorkflowBuilderPage: React.FC = () => {
  const {
    workflowRules,
    workflowHistory,
    createWorkflowRule,
    deleteWorkflowRule,
    simulateRuleTrigger
  } = useNotificationCenter();

  // Rule Form States
  const [ruleName, setRuleName] = useState('');
  const [triggerEvent, setTriggerEvent] = useState('issue_created');
  const [conditionKey, setConditionKey] = useState('severity');
  const [conditionVal, setConditionVal] = useState('critical');
  
  // Action Configuration States
  const [inAppAction, setInAppAction] = useState(true);
  const [emailAction, setEmailAction] = useState(true);
  const [smsAction, setSmsAction] = useState(false);
  const [pushAction, setPushAction] = useState(false);
  
  const [targetCitizen, setTargetCitizen] = useState(false);
  const [targetGov, setTargetGov] = useState(true);
  const [targetNgo, setTargetNgo] = useState(false);
  const [targetAdmin, setTargetAdmin] = useState(false);

  const [notifTitle, setNotifTitle] = useState('Critical Alert: {title}');
  const [notifMessage, setNotifMessage] = useState('An event was reported: {description}');
  const [delaySec, setDelaySec] = useState(0);

  // Simulator States
  const [simTrigger, setSimTrigger] = useState('issue_created');
  const [simPayload, setSimPayload] = useState(
    JSON.stringify({ severity: 'critical', title: 'Main Street Flood', description: 'Water pipeline burst near post office.' }, null, 2)
  );

  const handleSubmitRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName) return;

    // Build condition JSON
    const conditionObj: Record<string, string> = {};
    if (conditionKey && conditionVal) {
      conditionObj[conditionKey] = conditionVal;
    }
    const conditionStr = Object.keys(conditionObj).length > 0 ? JSON.stringify(conditionObj) : null;

    // Build action JSON
    const channels: string[] = [];
    if (inAppAction) channels.push('in_app');
    if (emailAction) channels.push('email');
    if (smsAction) channels.push('sms');
    if (pushAction) channels.push('push');

    const roles: string[] = [];
    if (targetCitizen) roles.push('Citizen');
    if (targetGov) roles.push('Government');
    if (targetNgo) roles.push('NGO');
    if (targetAdmin) roles.push('Admin');

    const actionObj = {
      channels,
      roles,
      title: notifTitle,
      message: notifMessage
    };

    await createWorkflowRule({
      name: ruleName,
      trigger: triggerEvent,
      condition: conditionStr,
      action: JSON.stringify(actionObj),
      delay: Number(delaySec),
      is_active: true
    });

    // Reset Form
    setRuleName('');
  };

  const handleSimulate = async () => {
    try {
      const parsed = JSON.parse(simPayload);
      await simulateRuleTrigger(simTrigger, parsed);
    } catch (err: any) {
      alert('Invalid JSON format in payload simulator input: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader
        title="Workflow Rules Builder"
        subtitle="Design event-driven automation pipelines. Connect municipal incidents directly to department notifications and citizen alerts."
        badge="Engine & Automation"
        center={false}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: Config Builder Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-primary" />
              New Rule Configuration Flow
            </h3>

            <form onSubmit={handleSubmitRule} className="space-y-6">
              
              {/* Step 1: Trigger Selection */}
              <div className="p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-primary" />
                  Step 1: Event Trigger Node
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Rule Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Critical Flooding Coordinator"
                      value={ruleName}
                      onChange={e => setRuleName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-primary/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Trigger Event</label>
                    <select
                      value={triggerEvent}
                      onChange={e => setTriggerEvent(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-primary/50"
                    >
                      <option value="issue_created">Issue Created (Citizen Report)</option>
                      <option value="issue_updated">Issue Status Updated</option>
                      <option value="emergency_triggered">Emergency Dispatch Triggered</option>
                      <option value="health_advisory_published">Healthcare Advisory Published</option>
                      <option value="scheme_recommended">Government Scheme Match Recommendation</option>
                      <option value="prediction_generated">Predictive Risk Forecast Index Generated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: Condition logic */}
              <div className="p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-accent" />
                  Step 2: Condition Gate (JSON filters)
                </span>
                <p className="text-[10px] text-slate-500">
                  Matches specific payload fields. Leave blank or default to match all events of this type.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Payload Property Key</label>
                    <input
                      type="text"
                      placeholder="e.g. severity"
                      value={conditionKey}
                      onChange={e => setConditionKey(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Expected Match Value</label>
                    <input
                      type="text"
                      placeholder="e.g. critical"
                      value={conditionVal}
                      onChange={e => setConditionVal(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Action target & Channels */}
              <div className="p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  Step 3: Action Node (Channels & Roles)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Channels Checklist */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Channels</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <label className="flex items-center gap-2 text-slate-300">
                        <input type="checkbox" checked={inAppAction} onChange={e => setInAppAction(e.target.checked)} />
                        In-App
                      </label>
                      <label className="flex items-center gap-2 text-slate-300">
                        <input type="checkbox" checked={emailAction} onChange={e => setEmailAction(e.target.checked)} />
                        Email
                      </label>
                      <label className="flex items-center gap-2 text-slate-300">
                        <input type="checkbox" checked={smsAction} onChange={e => setSmsAction(e.target.checked)} />
                        SMS
                      </label>
                      <label className="flex items-center gap-2 text-slate-300">
                        <input type="checkbox" checked={pushAction} onChange={e => setPushAction(e.target.checked)} />
                        Push
                      </label>
                    </div>
                  </div>

                  {/* Target Roles Checklist */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Recipient Roles</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <label className="flex items-center gap-2 text-slate-300">
                        <input type="checkbox" checked={targetCitizen} onChange={e => setTargetCitizen(e.target.checked)} />
                        Citizen
                      </label>
                      <label className="flex items-center gap-2 text-slate-300">
                        <input type="checkbox" checked={targetGov} onChange={e => setTargetGov(e.target.checked)} />
                        Government
                      </label>
                      <label className="flex items-center gap-2 text-slate-300">
                        <input type="checkbox" checked={targetNgo} onChange={e => setTargetNgo(e.target.checked)} />
                        NGO
                      </label>
                      <label className="flex items-center gap-2 text-slate-300">
                        <input type="checkbox" checked={targetAdmin} onChange={e => setTargetAdmin(e.target.checked)} />
                        Admin
                      </label>
                    </div>
                  </div>
                </div>

                {/* Templating */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Title Template (supports {"{param}"})</label>
                    <input
                      type="text"
                      value={notifTitle}
                      onChange={e => setNotifTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Message Template (supports {"{param}"})</label>
                    <input
                      type="text"
                      value={notifMessage}
                      onChange={e => setNotifMessage(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>

                {/* Delay & Timing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-accent" />
                      Rule Delay (seconds)
                    </label>
                    <input
                      type="number"
                      value={delaySec}
                      onChange={e => setDelaySec(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary hover:text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Deploy Rule
              </button>

            </form>
          </div>
        </div>

        {/* Column 2: Active Rules List & Simulator */}
        <div className="space-y-6">
          
          {/* Rules List */}
          <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
              <Cpu className="w-4.5 h-4.5 text-accent" />
              Active Deployed Rules ({workflowRules.length})
            </h3>
            
            {workflowRules.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-white/10 rounded-xl text-slate-500 text-xs">
                No active workflow automation rules.
              </div>
            ) : (
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {workflowRules.map(rule => (
                  <div key={rule.id} className="p-3 bg-slate-950/40 border border-white/5 rounded-xl flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-1">
                      <span className="font-bold text-xs text-slate-200 block">{rule.name}</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-slate-800 border border-white/5 rounded text-[8px] font-bold text-slate-400">
                          {rule.trigger}
                        </span>
                        {rule.condition && (
                          <span className="px-1.5 py-0.5 bg-accent/10 border border-accent/20 rounded text-[8px] font-semibold text-accent">
                            Cond: {rule.condition}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteWorkflowRule(rule.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded transition-all"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Simulator Panel */}
          <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
              <Play className="w-4.5 h-4.5 text-primary" />
              Sandbox Event Simulator
            </h3>
            <p className="text-[10px] text-slate-500 leading-normal">
              Publish custom mock data payloads directly to the Event Bus to test rules in real-time.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Select Event Type</label>
                <select
                  value={simTrigger}
                  onChange={e => setSimTrigger(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-primary/50"
                >
                  <option value="issue_created">issue_created</option>
                  <option value="issue_updated">issue_updated</option>
                  <option value="emergency_triggered">emergency_triggered</option>
                  <option value="health_advisory_published">health_advisory_published</option>
                  <option value="scheme_recommended">scheme_recommended</option>
                  <option value="prediction_generated">prediction_generated</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Payload JSON</label>
                <textarea
                  rows={5}
                  value={simPayload}
                  onChange={e => setSimPayload(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-primary/50"
                />
              </div>

              <button
                onClick={handleSimulate}
                className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-white rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                Fire Simulator Signal
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Timeline Section: Execution Logs */}
      <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
          <Activity className="w-4.5 h-4.5 text-primary" />
          Workflow Rule Run Audit History
        </h3>

        {workflowHistory.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-white/10 rounded-xl text-slate-500 text-xs">
            No rule audits logged. Use the Sandbox Event Simulator to trigger a workflow.
          </div>
        ) : (
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {workflowHistory.map(hist => (
              <div key={hist.id} className="p-4 bg-slate-950/40 border border-white/5 rounded-xl flex items-start gap-4">
                <div className={`p-2 rounded-lg shrink-0 ${
                  hist.execution_status === 'success' 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : hist.execution_status === 'delayed'
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {hist.execution_status === 'success' ? (
                    <Check className="w-4 h-4" />
                  ) : hist.execution_status === 'delayed' ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-200">{hist.rule_name}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(hist.executed_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">Trigger:</span>
                    <span className="px-1.5 py-0.5 bg-slate-800 border border-white/5 rounded text-[8px] font-semibold text-slate-400">
                      {hist.trigger_event}
                    </span>
                  </div>
                  {hist.details && (
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed bg-slate-900/50 p-2 rounded border border-white/5">
                      {hist.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default WorkflowBuilderPage;

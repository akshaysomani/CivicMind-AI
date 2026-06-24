from typing import Dict, Any, List, Optional
from app.ai.agents.base import ADKAgent
from app.ai.agents.placeholders import (
    CitizenAssistantAgent,
    EmergencyAdvisorAgent,
    SchemePlannerAgent,
    EnvironmentalInspectorAgent,
    GeneralConversationalAgent
)
from app.ai.agents.health import HealthcareAdvisorAgent
from app.ai.agents.schemes import SchemeAdvisorAgent
from app.ai.agents.analytics import AnalyticsInsightAgent
from app.ai.agents.forecasting import ForecastingAgent
from app.ai.agents.reporting import ExecutiveReportingAgent


class AgentRegistry:
    def __init__(self):
        self._agents: Dict[str, ADKAgent] = {}

    def register_agent(self, agent: ADKAgent):
        self._agents[agent.name] = agent

    def get_agent(self, name: str) -> Optional[ADKAgent]:
        return self._agents.get(name)

    def list_agents(self) -> List[Dict[str, Any]]:
        return [agent.get_metadata() for agent in self._agents.values()]

    def health_check_all(self) -> Dict[str, str]:
        return {name: agent.health_check() for name, agent in self._agents.items()}

# Global instance
agent_registry = AgentRegistry()

# Auto-register placeholder agents
agent_registry.register_agent(CitizenAssistantAgent())
agent_registry.register_agent(EmergencyAdvisorAgent())
agent_registry.register_agent(SchemePlannerAgent())
agent_registry.register_agent(EnvironmentalInspectorAgent())
agent_registry.register_agent(AnalyticsInsightAgent())
agent_registry.register_agent(GeneralConversationalAgent())
agent_registry.register_agent(HealthcareAdvisorAgent())
agent_registry.register_agent(SchemeAdvisorAgent())
agent_registry.register_agent(ForecastingAgent())
agent_registry.register_agent(ExecutiveReportingAgent())


<div id="commissionFlow">
	<div class="span-7">
	<p class="notice">Select Infrastructure Pattern</p>
	<form id="infrastructurePattern" action="${flowExecutionUrl}" method="POST">
		<h:outputLabel>Infrastructure Pattern: </h:outputLabel>
		<br/>
		<input type="radio" name="pattern" value="Basic" checked>Basic<br/>
 		<input type="radio" name="pattern" value="CAA">CAA<br/>
 		<input type="radio" name="pattern" value="HOT-HOT">HOT-HOT<br/>
 		<input type="radio" name="pattern" value="Layered">Layered<br/>
 		<input type="radio" name="pattern" value="Upload Custom">Custom<br/>
		<button id="previous" type="submit" name="_eventId_previous">Previous &lt;&lt;</button>
		<button id="next" type="submit" name="_eventId_next">Next &gt;&gt;</button>
		<button id="cancel" type="submit" name="_eventId_cancel">Cancel</button>
		<script type="text/javascript">
			Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'next',event:'onclick',formId:'infrastructurePattern',params:{fragments:"body"}}));
			Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'previous',event:'onclick',formId:'infrastructurePattern',params:{fragments:"body"}}));
			Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'cancel',event:'onclick',formId:'infrastructurePattern',params:{fragments:"body"}}));
		</script>
	</form>
	</div>
	<div class="span-6 last">
	<div style="margin-left: 1em;">
		<h6>Infrastructure</h6>
		<p>Aurea separates infrastructure from service applications. Infrastructure is provided in a number of 
		best-practice patterns provided by Aurea, and in customer provided patterns. For more complex
		environments a <i>layered</i> approach is recommended. <i>Layering</i> allows you deploy your system in a number of
		layers or tiers. Further, within an individual tier systems can be deployed in incremental steps.
		Aurea identifies the following tier types: Management and User Identity Tier, Core Messaging Tier,
		Messaging Segment Tier, Service Archetype Tier, Service Tier, Application Tier, Service 
		Binder Tier, and Application Binder Tier(ESB Connection, ESB Endpoint, ESB Container and placements).<p>
		<br/><b>Notes</b><br/>
		When I initially looked at Basic versus HOT-HOT versus CAA, my reaction was why even offer Basic
		as an option, wouldn't people automatically want CAA or HOT-HOT? I think the answer is this
		gets into pricing. If Basic is dirt cheap we can get the customer to buy in easily. I suspect that 
		when they see the remaining experience we can provide, he/she is going to be up-sold to CAA or HOT-HOT 
		very fast. There's a anecdote: the first time the customer adds services or performs maintenance through
		this portal and learns that <i>had</i> he elected
		something non-Basic, 24x7 updates were possible, he's going to be up-sold very fast. 
		<br/><br/>
		Upload of custom suggests an enhancement to current Workbench Deployment Modelling(DREM) i.e. don't
		constrain to the 3 OOB patterns. On the flip-side I think DREM tooling belongs
		elsewhere than Workbench e.g. as in a Web portal such as this.
		<br/><br/>
		D Kibble: &quot;Connections in general. Would it not be possible to abstract in the first instance
		(simple mode vs expert mode) the JMS connection entirely from the ESB containers? 
		We know that we associate an ESB container with a message broker cluster and we know what QoS we are 
		wishing to use. Could Sonic not then transparently create the connections and pools targeted to the 
		associated broker cluster(s)?&quot;
	</div>
	</div></div>
<div id="servicesFlow" xmlns:h="http://java.sun.com/jsf/html">
	<div class="span-7">
	<p class="notice">Ready to Update</p>
	<form id="finalReview" action="${flowExecutionUrl}" method="POST">
	   <p>
	   We are now ready to update your system.
	   <br/><br/>
	   Hit <b>Apply</b> to proceed.	
	   <br/><br/>   
	   Hit <b>Cancel</b> to abandon.
	   <br/><br/>   
	   Hit <b>Save</b> to save the SDM update model.
	   </p>
       	<button id="previous" type="submit" name="_eventId_previous">Previous &lt;&lt;</button>
		<button id="finish" type="submit" name="_eventId_finish">Apply &gt;&gt;</button>
		<button id="cancel" type="submit" name="_eventId_cancel">Cancel</button>
		<button id="save" type="submit" name="_eventId_save">Save</button>
		<script type="text/javascript">
		    Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'previous',event:'onclick',formId:'productionDomain',params:{fragments:"body"}}));
			Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'finish',event:'onclick',formId:'productionDomain',params:{fragments:"body"}}));
			Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'cancel',event:'onclick',formId:'productionDomain',params:{fragments:"body"}}));
			Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'save',event:'onclick',formId:'productionDomain',params:{fragments:"body"}}));
		</script>
	</form>
	</div>
	<div class="span-6 last">
	<div style="margin-left: 1em;">
	</div>
	</div>
</div>
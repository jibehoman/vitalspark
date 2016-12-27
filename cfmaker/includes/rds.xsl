<xsl:stylesheet version="2.0" 
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:saxon="http://saxon.sf.net/"
>
<!-- stylesheet to generate cloudformation variants
-->
<xsl:output method="text" omit-xml-declaration="yes"  indent="no" />



<!-- 

RDS Emiter

-->

<xsl:template name="emitRDS">
<xsl:if test="$vpcstyle ne 'hosted'">
<xsl:choose>
<xsl:when test="number($numavailabilityzones) le number(1)">
<!--

If you have one availability zone in your VPC you are not permitted to host RDS
in the VPC, so it has to be a public RDS resource, set up some lazy man security
for this resource
-->
<xsl:text>
    "GeneralDBSecurityGroup": {
      "Type": "AWS::RDS::DBSecurityGroup",
      "Properties": {
        "DBSecurityGroupIngress": { "CIDRIP" : "0.0.0.0/0"  },
        "GroupDescription"      : "Frontend Access",
</xsl:text>
<xsl:call-template name="emitTags">
    <xsl:with-param name="name" select="'SonicDBSecurity'" />
    <xsl:with-param name="description" select="'Sonic DBSecurity'" />
    <xsl:with-param name="dbowner" select="$dbowner" />
</xsl:call-template>
<xsl:text>
      }
    },
</xsl:text>
</xsl:when>
<xsl:otherwise>
<!-- Great, we have multi-AZs in the VPC, set up a DBSubnetGroup with all the
     private subnets
-->
<xsl:text>
    "DBSubnetGroup" : {
      "Type" : "AWS::RDS::DBSubnetGroup",
      "Properties" : {
        "DBSubnetGroupDescription" : "Subnets available for the Sonic RDS DB Instance",
        "SubnetIds": [
 </xsl:text>
<xsl:for-each select="tokenize($numbers,',')">
<xsl:if test="number(.) lt number($numavailabilityzones)">
<xsl:text>
          { "Ref" : "SonicZone</xsl:text><xsl:value-of select="."/><xsl:text>PrivateSubnet" },
 </xsl:text>
 </xsl:if>
<xsl:if test="number(.) eq number($numavailabilityzones)">
<xsl:text>
          { "Ref" : "SonicZone</xsl:text><xsl:value-of select="."/><xsl:text>PrivateSubnet" }
 </xsl:text>
 </xsl:if>
 </xsl:for-each>
 <xsl:text>
        ],
</xsl:text>
<xsl:call-template name="emitTags">
    <xsl:with-param name="name" select="'DBSubnetGroup'" />
    <xsl:with-param name="description" select="'DBSubnetGroup'" />
    <xsl:with-param name="dbowner" select="$dbowner" />
</xsl:call-template>
<xsl:text>
      }
    },

</xsl:text>
</xsl:otherwise>
<!-- nada -->
</xsl:choose>
</xsl:if>
<xsl:text>

    "DBInstance": {
      "Type": "AWS::RDS::DBInstance",
      "Properties": {
        "AllocatedStorage": "50",
        "AutoMinorVersionUpgrade": "true",
        "BackupRetentionPeriod": "3",
        "DBInstanceClass": "db.m1.small",
        "DBName": "SonicDB",
        "Engine": "oracle-se1",
        "EngineVersion": "11.2.0.2.v7",
        "LicenseModel": "license-included",
</xsl:text>
<xsl:choose>
<xsl:when test="$vpcstyle = 'hosted'">
<xsl:text>
        "VPCSecurityGroups": [ "</xsl:text><xsl:value-of select="$docroot/Template/HostClouds/HostCloud/SecurityGroups/DefaultInterior"/><xsl:text>" ],
        "DBSubnetGroupName": "</xsl:text><xsl:value-of select="$docroot/Template/HostClouds/HostCloud/RDS/SubnetGroup"/><xsl:text>",
</xsl:text>
</xsl:when>
<xsl:when test="number($numavailabilityzones) le 1">
        "DBSecurityGroups"  : [{ "Ref" : "GeneralDBSecurityGroup" }],
</xsl:when>
<xsl:otherwise>
<xsl:text>
        "DBSubnetGroupName" : { "Ref" : "DBSubnetGroup" },
        "VPCSecurityGroups" : [ { "Ref" : "SonicInstanceSecurityGroup" }  ],
</xsl:text>
</xsl:otherwise>
</xsl:choose>
<xsl:text>
        "MasterUsername": "ebms",
        "MasterUserPassword": "Aurea2013",
        "Port": "1521",
        "PreferredBackupWindow": "03:41-04:11",
        "PreferredMaintenanceWindow": "mon:10:16-mon:10:46",
</xsl:text>
<xsl:call-template name="emitTags">
    <xsl:with-param name="name" select="'SonicDBInstance'" />
    <xsl:with-param name="description" select="'Sonic DBInstance'" />
    <xsl:with-param name="dbowner" select="$dbowner" />
</xsl:call-template>
<xsl:text>
      }
    },
</xsl:text>
</xsl:template>

</xsl:stylesheet>

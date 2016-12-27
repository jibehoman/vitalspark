<xsl:stylesheet version="2.0" 
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:saxon="http://saxon.sf.net/"
>
<!-- stylesheet to generate cloudformation variants
-->
<xsl:output method="text" omit-xml-declaration="yes"  indent="no" />
<!-- 

TAG Emiter

-->

<xsl:template name="emitTags">
    <xsl:param name="name" />
    <xsl:param name="network" />
    <xsl:param name="dbowner" />
    <xsl:param name="description" />
<xsl:text>
                "Tags": [
                    {
                        "Key": "Name",
                        "Value": "</xsl:text><xsl:value-of select="$name"/><xsl:text>"
                    },
</xsl:text>
<xsl:if test="$network != ''">
<xsl:text>
                    {
                        "Key": "Network",
                        "Value": "</xsl:text><xsl:value-of select="$network"/><xsl:text>"
                    },
</xsl:text>
</xsl:if>
<xsl:text>
                    {
                        "Key": "Description",
                        "Value": "</xsl:text><xsl:value-of select="$description"/><xsl:text>"
                    },
                    {
                        "Key": "EnvironmentType",
                        "Value": {
                            "Ref": "EnvironmentType"
                        }
                    },
</xsl:text>
<xsl:choose>
<xsl:when test="$dbowner != ''">
<xsl:text>
                    {
                        "Key": "Owner",
                        "Value": "</xsl:text><xsl:value-of select="$dbowner"/><xsl:text>"
                    },
</xsl:text>
</xsl:when>
<xsl:otherwise>
<xsl:text>
                    {
                        "Key": "Owner",
                        "Value": {
                            "Ref": "Owner"
                        }
                    },
</xsl:text>
</xsl:otherwise>
</xsl:choose>
<xsl:text>
                    {
                        "Key": "ProductName",
                        "Value": {
                            "Ref": "ProductName"
                        }
                    },
                    {
                        "Key": "ServiceLine",
                        "Value": {
                            "Ref": "ServiceLine"
                        }
                    }
                ]
</xsl:text>
</xsl:template>
</xsl:stylesheet>

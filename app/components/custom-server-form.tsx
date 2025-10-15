import { IconButton } from "./button";
import { ListItem, Modal, showToast } from "./ui-lib";
import { useEffect, useState } from "react";
import { CustomServerDefinition, ArgsMapping } from "../mcp/types";
import { createServerFromTemplate } from "../mcp/templates";
import {
  validateServerDefinition,
  generateServerId,
  sanitizeServerDefinition,
} from "../utils/mcp-validation";
import { saveCustomServer, isServerIdUnique } from "../mcp/actions";
import AddIcon from "../icons/add.svg";
import DeleteIcon from "../icons/delete.svg";
import styles from "./custom-server-form.module.scss";

interface CustomServerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingServer?: CustomServerDefinition;
  selectedTemplateId?: string;
}

interface ConfigProperty {
  name: string;
  type: "string" | "array";
  description: string;
  required: boolean;
  itemLabel?: string;
  addButtonText?: string;
}

interface ArgsMappingEntry {
  key: string;
  type: "single" | "spread" | "env";
  position?: number;
  envKey?: string;
}

export function CustomServerForm({
  isOpen,
  onClose,
  onSave,
  editingServer,
  selectedTemplateId,
}: CustomServerFormProps) {
  const [activeTab, setActiveTab] = useState<"basic" | "command" | "advanced">(
    "basic",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Basic info
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [repo, setRepo] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  // Command config
  const [command, setCommand] = useState("");
  const [baseArgs, setBaseArgs] = useState<string[]>([]);
  const [configurable, setConfigurable] = useState(false);

  // Advanced config
  const [configProperties, setConfigProperties] = useState<ConfigProperty[]>(
    [],
  );
  const [argsMappings, setArgsMappings] = useState<ArgsMappingEntry[]>([]);

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      if (editingServer) {
        // Editing existing server
        setId(editingServer.id);
        setName(editingServer.name);
        setDescription(editingServer.description);
        setRepo(editingServer.repo);
        setTags(editingServer.tags);
        setCommand(editingServer.command);
        setBaseArgs(editingServer.baseArgs);
        setConfigurable(editingServer.configurable);

        // Parse config schema
        if (editingServer.configSchema?.properties) {
          const properties: ConfigProperty[] = Object.entries(
            editingServer.configSchema.properties,
          ).map(([name, prop]) => ({
            name,
            type: prop.type as "string" | "array",
            description: prop.description || "",
            required: prop.required || false,
            itemLabel: prop.itemLabel,
            addButtonText: prop.addButtonText,
          }));
          setConfigProperties(properties);
        }

        // Parse args mapping
        if (editingServer.argsMapping) {
          const mappings: ArgsMappingEntry[] = Object.entries(
            editingServer.argsMapping,
          ).map(([key, mapping]) => ({
            key,
            type: mapping.type,
            position: mapping.position,
            envKey: mapping.key,
          }));
          setArgsMappings(mappings);
        }
      } else if (selectedTemplateId) {
        // Using template
        const templateServer = createServerFromTemplate(selectedTemplateId);
        if (templateServer) {
          setId(templateServer.id);
          setName(templateServer.name);
          setDescription(templateServer.description);
          setRepo(templateServer.repo);
          setTags(templateServer.tags);
          setCommand(templateServer.command);
          setBaseArgs(templateServer.baseArgs);
          setConfigurable(templateServer.configurable);

          // Parse config schema
          if (templateServer.configSchema?.properties) {
            const properties: ConfigProperty[] = Object.entries(
              templateServer.configSchema.properties,
            ).map(([name, prop]) => ({
              name,
              type: prop.type as "string" | "array",
              description: prop.description || "",
              required: prop.required || false,
              itemLabel: prop.itemLabel,
              addButtonText: prop.addButtonText,
            }));
            setConfigProperties(properties);
          }

          // Parse args mapping
          if (templateServer.argsMapping) {
            const mappings: ArgsMappingEntry[] = Object.entries(
              templateServer.argsMapping,
            ).map(([key, mapping]) => ({
              key,
              type: mapping.type,
              position: mapping.position,
              envKey: mapping.key,
            }));
            setArgsMappings(mappings);
          }
        }
      } else {
        // New server - reset form
        setId("");
        setName("");
        setDescription("");
        setRepo("");
        setTags([]);
        setCommand("");
        setBaseArgs([]);
        setConfigurable(false);
        setConfigProperties([]);
        setArgsMappings([]);
      }
      setActiveTab("basic");
      setValidationErrors({});
    }
  }, [isOpen, editingServer, selectedTemplateId]);

  // Auto-generate ID from name
  useEffect(() => {
    if (name && !editingServer) {
      const generatedId = generateServerId(name);
      setId(generatedId);
    }
  }, [name, editingServer]);

  // Validate ID uniqueness
  useEffect(() => {
    if (id && !editingServer) {
      const checkUniqueness = async () => {
        const isUnique = await isServerIdUnique(id);
        if (!isUnique) {
          setValidationErrors((prev) => ({
            ...prev,
            id: "Server ID already exists",
          }));
        } else {
          setValidationErrors((prev) => {
            const { id: _, ...rest } = prev;
            return rest;
          });
        }
      };
      checkUniqueness();
    }
  }, [id, editingServer]);

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 10) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const addBaseArg = () => {
    setBaseArgs([...baseArgs, ""]);
  };

  const updateBaseArg = (index: number, value: string) => {
    const newArgs = [...baseArgs];
    newArgs[index] = value;
    setBaseArgs(newArgs);
  };

  const removeBaseArg = (index: number) => {
    setBaseArgs(baseArgs.filter((_, i) => i !== index));
  };

  const addConfigProperty = () => {
    setConfigProperties([
      ...configProperties,
      {
        name: "",
        type: "string",
        description: "",
        required: false,
      },
    ]);
  };

  const updateConfigProperty = (
    index: number,
    updates: Partial<ConfigProperty>,
  ) => {
    const newProperties = [...configProperties];
    newProperties[index] = { ...newProperties[index], ...updates };
    setConfigProperties(newProperties);
  };

  const removeConfigProperty = (index: number) => {
    const newProperties = configProperties.filter((_, i) => i !== index);
    setConfigProperties(newProperties);

    // Remove corresponding args mapping
    const propertyName = configProperties[index]?.name;
    if (propertyName) {
      setArgsMappings(
        argsMappings.filter((mapping) => mapping.key !== propertyName),
      );
    }
  };

  const addArgsMapping = (propertyName: string) => {
    setArgsMappings([
      ...argsMappings,
      {
        key: propertyName,
        type: "single",
        position: 0,
      },
    ]);
  };

  const updateArgsMapping = (
    index: number,
    updates: Partial<ArgsMappingEntry>,
  ) => {
    const newMappings = [...argsMappings];
    newMappings[index] = { ...newMappings[index], ...updates };
    setArgsMappings(newMappings);
  };

  const removeArgsMapping = (index: number) => {
    setArgsMappings(argsMappings.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Build server definition
      const serverData: Partial<CustomServerDefinition> = {
        id: id.trim(),
        name: name.trim(),
        description: description.trim(),
        repo: repo.trim(),
        tags: tags,
        command: command.trim(),
        baseArgs: baseArgs.filter((arg) => arg.trim().length > 0),
        configurable,
      };

      // Add config schema if configurable
      if (configurable && configProperties.length > 0) {
        const properties: Record<string, any> = {};
        configProperties.forEach((prop) => {
          if (prop.name.trim()) {
            properties[prop.name.trim()] = {
              type: prop.type,
              description: prop.description.trim(),
              required: prop.required,
              ...(prop.type === "array" && {
                itemLabel: prop.itemLabel?.trim(),
                addButtonText: prop.addButtonText?.trim(),
              }),
            };
          }
        });

        if (Object.keys(properties).length > 0) {
          serverData.configSchema = { properties };
        }
      }

      // Add args mapping if configurable
      if (configurable && argsMappings.length > 0) {
        const mapping: Record<string, ArgsMapping> = {};
        argsMappings.forEach((m) => {
          if (m.key.trim()) {
            mapping[m.key.trim()] = {
              type: m.type,
              ...(m.type === "env" && m.envKey && { key: m.envKey }),
              ...(m.type !== "env" &&
                m.position !== undefined && { position: m.position }),
            };
          }
        });

        if (Object.keys(mapping).length > 0) {
          serverData.argsMapping = mapping;
        }
      }

      // Sanitize and validate
      const sanitized = sanitizeServerDefinition(serverData);
      const validation = validateServerDefinition(sanitized);

      if (!validation.isValid) {
        const errors: Record<string, string> = {};
        validation.errors.forEach((error) => {
          errors[error.field] = error.message;
        });
        setValidationErrors(errors);
        showToast("Please fix the validation errors");
        return;
      }

      // Create final server definition
      const now = new Date().toISOString();
      const finalServer: CustomServerDefinition = {
        ...(sanitized as CustomServerDefinition),
        custom: true,
        createdAt: editingServer?.createdAt || now,
        updatedAt: now,
      };

      // Save server
      await saveCustomServer(finalServer);
      showToast("Custom server saved successfully");
      onSave();
      onClose();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to save server",
      );
      console.error("Failed to save custom server:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderBasicTab = () => (
    <div className={styles["form-tab"]}>
      <ListItem title="Server ID" subTitle="Unique identifier for the server">
        <>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="my-server-id"
            className={validationErrors.id ? styles["error"] : ""}
          />
          {validationErrors.id && (
            <div className={styles["error-message"]}>{validationErrors.id}</div>
          )}
        </>
      </ListItem>

      <ListItem title="Display Name" subTitle="Human-readable name">
        <>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Server"
            className={validationErrors.name ? styles["error"] : ""}
          />
          {validationErrors.name && (
            <div className={styles["error-message"]}>
              {validationErrors.name}
            </div>
          )}
        </>
      </ListItem>

      <ListItem
        title="Description"
        subTitle="Brief description of what the server does"
      >
        <>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="This server provides..."
            rows={3}
            className={validationErrors.description ? styles["error"] : ""}
          />
          {validationErrors.description && (
            <div className={styles["error-message"]}>
              {validationErrors.description}
            </div>
          )}
        </>
      </ListItem>

      <ListItem
        title="Repository URL"
        subTitle="Optional GitHub repository URL"
      >
        <>
          <input
            type="url"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            placeholder="https://github.com/user/repo"
            className={validationErrors.repo ? styles["error"] : ""}
          />
          {validationErrors.repo && (
            <div className={styles["error-message"]}>
              {validationErrors.repo}
            </div>
          )}
        </>
      </ListItem>

      <ListItem
        title="Tags"
        subTitle="Categories for organizing servers"
        vertical
      >
        <>
          <div className={styles["tags-container"]}>
            {tags.map((tag, index) => (
              <span key={index} className={styles["tag"]}>
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className={styles["tag-remove"]}
                >
                  ×
                </button>
              </span>
            ))}
            {tags.length < 10 && (
              <div className={styles["tag-input"]}>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                  placeholder="Add tag"
                  maxLength={20}
                />
                <IconButton
                  icon={<AddIcon />}
                  onClick={addTag}
                  disabled={!newTag.trim()}
                  className={styles["add-tag-button"]}
                />
              </div>
            )}
          </div>
          {validationErrors.tags && (
            <div className={styles["error-message"]}>
              {validationErrors.tags}
            </div>
          )}
        </>
      </ListItem>
    </div>
  );

  const renderCommandTab = () => (
    <div className={styles["form-tab"]}>
      <ListItem title="Command" subTitle="Command to execute the server">
        <>
          <select
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            className={validationErrors.command ? styles["error"] : ""}
          >
            <option value="">Select command...</option>
            <option value="npx">npx</option>
            <option value="node">node</option>
            <option value="python">python</option>
            <option value="python3">python3</option>
            <option value="uvx">uvx</option>
            <option value="npm">npm</option>
            <option value="yarn">yarn</option>
            <option value="custom">Custom...</option>
          </select>
          {command === "custom" && (
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Enter custom command"
              className={styles["custom-command"]}
            />
          )}
          {validationErrors.command && (
            <div className={styles["error-message"]}>
              {validationErrors.command}
            </div>
          )}
        </>
      </ListItem>

      <ListItem
        title="Base Arguments"
        subTitle="Command line arguments"
        vertical
      >
        <>
          <div className={styles["args-container"]}>
            {baseArgs.map((arg, index) => (
              <div key={index} className={styles["arg-item"]}>
                <input
                  type="text"
                  value={arg}
                  onChange={(e) => updateBaseArg(index, e.target.value)}
                  placeholder={`Argument ${index + 1}`}
                />
                <IconButton
                  icon={<DeleteIcon />}
                  onClick={() => removeBaseArg(index)}
                  className={styles["remove-arg-button"]}
                />
              </div>
            ))}
            <IconButton
              icon={<AddIcon />}
              text="Add Argument"
              onClick={addBaseArg}
              bordered
              className={styles["add-arg-button"]}
            />
          </div>
          {validationErrors.baseArgs && (
            <div className={styles["error-message"]}>
              {validationErrors.baseArgs}
            </div>
          )}
        </>
      </ListItem>

      <ListItem
        title="Configuration Required"
        subTitle="Whether users need to configure this server"
      >
        <label className={styles["checkbox-label"]}>
          <input
            type="checkbox"
            checked={configurable}
            onChange={(e) => setConfigurable(e.target.checked)}
          />
          This server requires user configuration
        </label>
      </ListItem>
    </div>
  );

  const renderAdvancedTab = () => (
    <div className={styles["form-tab"]}>
      {!configurable ? (
        <div className={styles["disabled-message"]}>
          Enable &quot;Configuration Required&quot; in the Command tab to
          configure advanced settings.
        </div>
      ) : (
        <>
          <div className={styles["section-header"]}>
            <h3>Configuration Schema</h3>
            <IconButton
              icon={<AddIcon />}
              text="Add Property"
              onClick={addConfigProperty}
              bordered
            />
          </div>

          {configProperties.map((prop, index) => (
            <div key={index} className={styles["property-item"]}>
              <div className={styles["property-header"]}>
                <input
                  type="text"
                  value={prop.name}
                  onChange={(e) =>
                    updateConfigProperty(index, { name: e.target.value })
                  }
                  placeholder="Property name"
                  className={styles["property-name"]}
                />
                <select
                  value={prop.type}
                  onChange={(e) =>
                    updateConfigProperty(index, {
                      type: e.target.value as "string" | "array",
                    })
                  }
                  className={styles["property-type"]}
                >
                  <option value="string">String</option>
                  <option value="array">Array</option>
                </select>
                <IconButton
                  icon={<DeleteIcon />}
                  onClick={() => removeConfigProperty(index)}
                  className={styles["remove-property-button"]}
                />
              </div>

              <textarea
                value={prop.description}
                onChange={(e) =>
                  updateConfigProperty(index, { description: e.target.value })
                }
                placeholder="Property description"
                rows={2}
                className={styles["property-description"]}
              />

              <div className={styles["property-options"]}>
                <label className={styles["checkbox-label"]}>
                  <input
                    type="checkbox"
                    checked={prop.required}
                    onChange={(e) =>
                      updateConfigProperty(index, {
                        required: e.target.checked,
                      })
                    }
                  />
                  Required
                </label>

                {prop.type === "array" && (
                  <>
                    <input
                      type="text"
                      value={prop.itemLabel || ""}
                      onChange={(e) =>
                        updateConfigProperty(index, {
                          itemLabel: e.target.value,
                        })
                      }
                      placeholder="Item label (e.g., 'Path')"
                      className={styles["array-option"]}
                    />
                    <input
                      type="text"
                      value={prop.addButtonText || ""}
                      onChange={(e) =>
                        updateConfigProperty(index, {
                          addButtonText: e.target.value,
                        })
                      }
                      placeholder="Add button text (e.g., 'Add Path')"
                      className={styles["array-option"]}
                    />
                  </>
                )}
              </div>

              {!argsMappings.find((m) => m.key === prop.name) &&
                prop.name.trim() && (
                  <IconButton
                    icon={<AddIcon />}
                    text="Add Args Mapping"
                    onClick={() => addArgsMapping(prop.name)}
                    bordered
                    className={styles["add-mapping-button"]}
                  />
                )}
            </div>
          ))}

          {argsMappings.length > 0 && (
            <>
              <div className={styles["section-header"]}>
                <h3>Arguments Mapping</h3>
              </div>

              {argsMappings.map((mapping, index) => (
                <div key={index} className={styles["mapping-item"]}>
                  <div className={styles["mapping-header"]}>
                    <span className={styles["mapping-key"]}>{mapping.key}</span>
                    <select
                      value={mapping.type}
                      onChange={(e) =>
                        updateArgsMapping(index, {
                          type: e.target.value as "single" | "spread" | "env",
                        })
                      }
                      className={styles["mapping-type"]}
                    >
                      <option value="single">Single Argument</option>
                      <option value="spread">Spread Arguments</option>
                      <option value="env">Environment Variable</option>
                    </select>
                    <IconButton
                      icon={<DeleteIcon />}
                      onClick={() => removeArgsMapping(index)}
                      className={styles["remove-mapping-button"]}
                    />
                  </div>

                  {mapping.type === "env" ? (
                    <input
                      type="text"
                      value={mapping.envKey || ""}
                      onChange={(e) =>
                        updateArgsMapping(index, { envKey: e.target.value })
                      }
                      placeholder="Environment variable name (e.g., API_KEY)"
                      className={styles["env-key-input"]}
                    />
                  ) : (
                    <input
                      type="number"
                      value={mapping.position || 0}
                      onChange={(e) =>
                        updateArgsMapping(index, {
                          position: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="Position in arguments array"
                      min="0"
                      className={styles["position-input"]}
                    />
                  )}
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );

  return (
    <Modal
      title={editingServer ? "Edit Custom Server" : "Create Custom Server"}
      onClose={onClose}
      actions={[
        <IconButton
          key="cancel"
          text="Cancel"
          onClick={onClose}
          bordered
          disabled={isLoading}
        />,
        <IconButton
          key="save"
          text="Save"
          type="primary"
          onClick={handleSave}
          bordered
          disabled={isLoading}
        />,
      ]}
    >
      <div className={styles["custom-server-form"]}>
        <div className={styles["form-tabs"]}>
          <button
            className={`${styles["tab"]} ${
              activeTab === "basic" ? styles["active"] : ""
            }`}
            onClick={() => setActiveTab("basic")}
          >
            Basic Info
          </button>
          <button
            className={`${styles["tab"]} ${
              activeTab === "command" ? styles["active"] : ""
            }`}
            onClick={() => setActiveTab("command")}
          >
            Command
          </button>
          <button
            className={`${styles["tab"]} ${
              activeTab === "advanced" ? styles["active"] : ""
            }`}
            onClick={() => setActiveTab("advanced")}
          >
            Advanced
          </button>
        </div>

        <div className={styles["form-content"]}>
          {activeTab === "basic" && renderBasicTab()}
          {activeTab === "command" && renderCommandTab()}
          {activeTab === "advanced" && renderAdvancedTab()}
        </div>
      </div>
    </Modal>
  );
}

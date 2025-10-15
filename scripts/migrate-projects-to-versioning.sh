#!/bin/bash

# Script to migrate existing projects to version-based naming system
# This script renames project files and reorganizes them by version

echo "🔄 Migrating projects to version-based naming system..."

# Create version directories if they don't exist
mkdir -p docs/projects/active/v1
mkdir -p docs/projects/completed/v1

# Function to migrate a project file
migrate_project() {
    local old_file="$1"
    local new_location="$2"
    local project_type="$3"
    local project_name="$4"
    local version="$5"
    
    echo "📁 Migrating: $old_file"
    
    # Extract date from filename if present
    local date_part=$(basename "$old_file" | grep -o '^[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}')
    
    # Create new filename
    local new_filename="${project_type}-${project_name}-v${version}.md"
    local new_file="${new_location}/${new_filename}"
    
    # Copy file to new location
    cp "$old_file" "$new_file"
    
    # Update the file content to include version information
    sed -i "1s/^/# ${project_type}-${project_name}-v${version}.md\n\n/" "$new_file"
    
    # Add version metadata if not present
    if ! grep -q "### Version Information" "$new_file"; then
        cat >> "$new_file" << EOF

## Version Information

### Current Version
- **Version**: v${version}
- **Created**: ${date_part:-$(date '+%Y-%m-%d')}
- **Last Updated**: $(date '+%Y-%m-%d')
- **Migration Date**: $(date '+%Y-%m-%d')

### Version History
- **v${version}**: Initial version (migrated from date-based naming)

EOF
    fi
    
    echo "✅ Migrated to: $new_file"
}

# Migrate active projects
echo "📂 Migrating active projects..."
for file in docs/projects/active/*.md; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        
        # Extract project information
        if [[ $filename =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}-(.+)-(.+)\.md$ ]]; then
            project_name="${BASH_REMATCH[1]}-${BASH_REMATCH[2]}"
            project_type="feature"  # Default type
        elif [[ $filename =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}-(.+)\.md$ ]]; then
            project_name="${BASH_REMATCH[1]}"
            project_type="feature"  # Default type
        else
            project_name=$(echo "$filename" | sed 's/^[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}-//' | sed 's/\.md$//')
            project_type="feature"  # Default type
        fi
        
        # Determine project type based on name
        if [[ $project_name =~ refactor|modulariz ]]; then
            project_type="refactor"
        elif [[ $project_name =~ bugfix|fix ]]; then
            project_type="bugfix"
        elif [[ $project_name =~ doc|documentation ]]; then
            project_type="documentation"
        elif [[ $project_name =~ auth|authentication ]]; then
            project_type="feature"
        fi
        
        migrate_project "$file" "docs/projects/active/v1" "$project_type" "$project_name" "1.0.0"
    fi
done

# Migrate completed projects
echo "📂 Migrating completed projects..."
for file in docs/projects/completed/*.md; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        
        # Extract project information
        if [[ $filename =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}-(.+)-(.+)\.md$ ]]; then
            project_name="${BASH_REMATCH[1]}-${BASH_REMATCH[2]}"
            project_type="feature"  # Default type
        elif [[ $filename =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}-(.+)\.md$ ]]; then
            project_name="${BASH_REMATCH[1]}"
            project_type="feature"  # Default type
        else
            project_name=$(echo "$filename" | sed 's/^[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}-//' | sed 's/\.md$//')
            project_type="feature"  # Default type
        fi
        
        # Determine project type based on name
        if [[ $project_name =~ refactor|modulariz ]]; then
            project_type="refactor"
        elif [[ $project_name =~ bugfix|fix ]]; then
            project_type="bugfix"
        elif [[ $project_name =~ doc|documentation ]]; then
            project_type="documentation"
        elif [[ $project_name =~ auth|authentication ]]; then
            project_type="feature"
        fi
        
        migrate_project "$file" "docs/projects/completed/v1" "$project_type" "$project_name" "1.0.0"
    fi
done

# Create a migration log
echo "📝 Creating migration log..."
cat > docs/projects/MIGRATION_LOG.md << EOF
# Project Migration Log

## Migration Date
$(date '+%Y-%m-%d %H:%M:%S')

## Migration Summary
- **From**: Date-based naming (YYYY-MM-DD-project-name.md)
- **To**: Version-based naming (project-type-project-name-v{major}.{minor}.{patch}.md)
- **Organization**: Version-organized directory structure

## Migrated Projects

### Active Projects (v1.0.0)
EOF

# List migrated active projects
for file in docs/projects/active/v1/*.md; do
    if [ -f "$file" ]; then
        echo "- $(basename "$file")" >> docs/projects/MIGRATION_LOG.md
    fi
done

echo "
### Completed Projects (v1.0.0)" >> docs/projects/MIGRATION_LOG.md

# List migrated completed projects
for file in docs/projects/completed/v1/*.md; do
    if [ -f "$file" ]; then
        echo "- $(basename "$file")" >> docs/projects/MIGRATION_LOG.md
    fi
done

cat >> docs/projects/MIGRATION_LOG.md << EOF

## Migration Benefits
- **Version Control**: Clear version tracking and progression
- **Plan Analysis**: Better support for plan analysis and optimization
- **Commit Integration**: Improved commit message standards and automation
- **Organization**: Version-organized directory structure
- **Scalability**: Better support for multiple versions and branches

## Next Steps
1. Review migrated projects for accuracy
2. Update project references in documentation
3. Test new commit integration system
4. Begin using version-based naming for new projects
EOF

echo "✅ Migration completed successfully!"
echo "📊 Migration log created: docs/projects/MIGRATION_LOG.md"
echo "📁 Active projects migrated to: docs/projects/active/v1/"
echo "📁 Completed projects migrated to: docs/projects/completed/v1/"
echo ""
echo "🔄 Next steps:"
echo "1. Review migrated projects"
echo "2. Test new commit integration system"
echo "3. Begin using version-based naming for new projects"

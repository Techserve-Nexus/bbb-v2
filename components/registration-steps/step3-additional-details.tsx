"use client"

import { CONCLAVE_GROUPS, PARTICIPATION_OPTIONS } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

interface Step3Props {
  formData: any
  setFormData: (data: any) => void
}

export default function Step3AdditionalDetails({ formData, setFormData }: Step3Props) {
  const handleChildChange = (index: number, field: string, value: string) => {
    const newChildren = [...formData.children]
    newChildren[index] = { ...newChildren[index], [field]: value }
    setFormData({ ...formData, children: newChildren })
  }

  const handleParticipationToggle = (option: string) => {
    const newParticipations = formData.participations.includes(option)
      ? formData.participations.filter((p: string) => p !== option)
      : [...formData.participations, option]
    setFormData({ ...formData, participations: newParticipations })
  }

  const handleConclaveToggle = (group: string) => {
    const newGroups = formData.conclavGroups.includes(group)
      ? formData.conclavGroups.filter((g: string) => g !== group)
      : [...formData.conclavGroups, group]
    setFormData({ ...formData, conclavGroups: newGroups })
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-foreground mb-8">Additional Details</h2>

      <div className="space-y-8">
        {/* Spouse Name */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Spouse Name (Optional)</label>
          <input
            type="text"
            value={formData.spouseName || ""}
            onChange={(e) => setFormData({ ...formData, spouseName: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border-2 border-border focus:border-primary outline-none bg-background text-foreground placeholder-muted-foreground transition-colors"
            placeholder="If applicable"
          />
        </div>

        {/* Children Details */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Children Details (Optional)</h3>
          <div className="space-y-4">
            {formData.children.map((child: any, index: number) => (
              <div key={index} className="grid md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-border">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Child {index + 1} Name</label>
                  <input
                    type="text"
                    value={child.name}
                    onChange={(e) => handleChildChange(index, "name", e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-border focus:border-primary outline-none bg-background text-foreground placeholder-muted-foreground transition-colors"
                    placeholder={`Child ${index + 1} name`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Age Group</label>
                  <select
                    value={child.age}
                    onChange={(e) => handleChildChange(index, "age", e.target.value as "<12" | ">12")}
                    className="w-full px-4 py-3 rounded-lg border-2 border-border focus:border-primary outline-none bg-background text-foreground transition-colors"
                  >
                    <option value="<12">Less than 12 years</option>
                    <option value=">12">More than 12 years</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Participation Options */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Events to Participate In</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {PARTICIPATION_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={formData.participations.includes(option.value)}
                  onCheckedChange={() => handleParticipationToggle(option.value)}
                  className="w-5 h-5 border-2 border-border accent-primary"
                />
                <span className="text-foreground font-medium">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Conclave Groups */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Core Conclave Groups (Optional)</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {CONCLAVE_GROUPS.map((group) => (
              <label
                key={group}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={formData.conclavGroups.includes(group)}
                  onCheckedChange={() => handleConclaveToggle(group)}
                  className="w-5 h-5 border-2 border-border accent-primary"
                />
                <span className="text-foreground font-medium">{group}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm text-foreground mb-2">
            <strong>Registration Summary:</strong>
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Name: {formData.name || "Not provided"}</li>
            <li>• Ticket: {formData.ticketType || "Not selected"}</li>
            <li>• Participations: {formData.participations.length || "None"} selected</li>
            <li>• Conclave Groups: {formData.conclavGroups.length || "None"} selected</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

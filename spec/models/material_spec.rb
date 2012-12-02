# == Schema Information
#
# Table name: materials
#
#  id           :integer          not null, primary key
#  name         :string(255)
#  quantity     :decimal(12, 4)
#  units        :string(255)
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  buyable_id   :integer
#  buyable_type :string(255)
#

require 'spec_helper'

describe Material do
  pending "add some examples to (or delete) #{__FILE__}"
end

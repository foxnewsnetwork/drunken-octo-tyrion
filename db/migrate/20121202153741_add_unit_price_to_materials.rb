class AddUnitPriceToMaterials < ActiveRecord::Migration
  def change
    add_column :materials, :unit_price, :decimal, :precision => 12, :scale => 4
  end
end
